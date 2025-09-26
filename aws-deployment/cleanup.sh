#!/bin/bash

# Cleanup Script for AWS Resources
# This script removes all AWS resources created for the Ticket Hub deployment

set -e

AWS_REGION=${AWS_REGION:-"us-east-1"}
STACK_NAME="ticket-hub-infrastructure"
REPOSITORY_NAME="ticket-hub-app"
CLUSTER_NAME="ticket-hub-cluster"
SERVICE_NAME="ticket-hub-service"

echo "🧹 Starting cleanup of AWS resources for Ticket Hub..."
echo "⚠️  WARNING: This will delete all AWS resources for the Ticket Hub deployment!"
echo ""

# Confirm with user
read -p "Are you sure you want to proceed? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cleanup cancelled."
    exit 1
fi

echo ""
echo "🔄 Starting cleanup process..."

# Stop ECS service
echo "🛑 Stopping ECS service..."
if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION 2>/dev/null; then
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --desired-count 0 \
        --region $AWS_REGION
    
    echo "⏳ Waiting for service tasks to stop..."
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $SERVICE_NAME \
        --region $AWS_REGION
    
    echo "🗑️ Deleting ECS service..."
    aws ecs delete-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --force \
        --region $AWS_REGION
    echo "✅ ECS service deleted"
else
    echo "ℹ️ ECS service not found or already deleted"
fi

# Delete CloudFormation stack
echo "☁️ Deleting CloudFormation stack..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION 2>/dev/null; then
    aws cloudformation delete-stack \
        --stack-name $STACK_NAME \
        --region $AWS_REGION
    
    echo "⏳ Waiting for stack deletion to complete..."
    aws cloudformation wait stack-delete-complete \
        --stack-name $STACK_NAME \
        --region $AWS_REGION
    echo "✅ CloudFormation stack deleted"
else
    echo "ℹ️ CloudFormation stack not found or already deleted"
fi

# Delete ECR repository
echo "📦 Deleting ECR repository..."
if aws ecr describe-repositories --repository-names $REPOSITORY_NAME --region $AWS_REGION 2>/dev/null; then
    aws ecr delete-repository \
        --repository-name $REPOSITORY_NAME \
        --force \
        --region $AWS_REGION
    echo "✅ ECR repository deleted"
else
    echo "ℹ️ ECR repository not found or already deleted"
fi

# Delete CloudWatch log groups
echo "📊 Deleting CloudWatch log groups..."
LOG_GROUPS=$(aws logs describe-log-groups \
    --log-group-name-prefix "/ecs/ticket-hub" \
    --region $AWS_REGION \
    --query 'logGroups[].logGroupName' \
    --output text 2>/dev/null || echo "")

if [ ! -z "$LOG_GROUPS" ]; then
    for log_group in $LOG_GROUPS; do
        echo "🗑️ Deleting log group: $log_group"
        aws logs delete-log-group \
            --log-group-name $log_group \
            --region $AWS_REGION
    done
    echo "✅ CloudWatch log groups deleted"
else
    echo "ℹ️ No CloudWatch log groups found"
fi

# Delete CloudWatch alarms
echo "⚠️ Deleting CloudWatch alarms..."
ALARMS=$(aws cloudwatch describe-alarms \
    --alarm-name-prefix "ticket-hub" \
    --region $AWS_REGION \
    --query 'MetricAlarms[].AlarmName' \
    --output text 2>/dev/null || echo "")

if [ ! -z "$ALARMS" ]; then
    aws cloudwatch delete-alarms \
        --alarm-names $ALARMS \
        --region $AWS_REGION
    echo "✅ CloudWatch alarms deleted"
else
    echo "ℹ️ No CloudWatch alarms found"
fi

# Delete CloudWatch dashboard
echo "📈 Deleting CloudWatch dashboard..."
if aws cloudwatch get-dashboard --dashboard-name "TicketHub-Dashboard" --region $AWS_REGION 2>/dev/null; then
    aws cloudwatch delete-dashboards \
        --dashboard-names "TicketHub-Dashboard" \
        --region $AWS_REGION
    echo "✅ CloudWatch dashboard deleted"
else
    echo "ℹ️ CloudWatch dashboard not found"
fi

# Delete SNS topic
echo "📧 Deleting SNS topic..."
SNS_TOPICS=$(aws sns list-topics \
    --region $AWS_REGION \
    --query 'Topics[?contains(TopicArn, `ticket-hub-alerts`)].TopicArn' \
    --output text 2>/dev/null || echo "")

if [ ! -z "$SNS_TOPICS" ]; then
    for topic in $SNS_TOPICS; do
        echo "🗑️ Deleting SNS topic: $topic"
        aws sns delete-topic \
            --topic-arn $topic \
            --region $AWS_REGION
    done
    echo "✅ SNS topics deleted"
else
    echo "ℹ️ No SNS topics found"
fi

# Clean up local Docker images
echo "🐳 Cleaning up local Docker images..."
if docker images | grep -q $REPOSITORY_NAME; then
    docker rmi $(docker images | grep $REPOSITORY_NAME | awk '{print $3}') --force 2>/dev/null || true
    echo "✅ Local Docker images cleaned up"
else
    echo "ℹ️ No local Docker images found"
fi

echo ""
echo "🎉 Cleanup completed successfully!"
echo ""
echo "📋 Cleanup Summary:"
echo "=================="
echo "✅ ECS service stopped and deleted"
echo "✅ CloudFormation stack deleted"
echo "✅ ECR repository deleted"
echo "✅ CloudWatch resources deleted"
echo "✅ SNS topics deleted"
echo "✅ Local Docker images cleaned up"
echo ""
echo "💡 Note: Some resources like VPC endpoints or NAT gateways"
echo "   may take additional time to fully terminate."
echo ""
echo "🔍 To verify all resources are deleted, check the AWS console:"
echo "   - ECS: https://console.aws.amazon.com/ecs/"
echo "   - CloudFormation: https://console.aws.amazon.com/cloudformation/"
echo "   - ECR: https://console.aws.amazon.com/ecr/"
echo "   - CloudWatch: https://console.aws.amazon.com/cloudwatch/"
#!/bin/bash

# Monitoring Setup Script for AWS ECS Deployment
# Sets up CloudWatch monitoring, alarms, and dashboards

set -e

AWS_REGION=${AWS_REGION:-"us-east-1"}
CLUSTER_NAME="ticket-hub-cluster"
SERVICE_NAME="ticket-hub-service"
SNS_TOPIC_NAME="ticket-hub-alerts"
EMAIL_ENDPOINT=${EMAIL_ENDPOINT:-"admin@yourdomain.com"}

echo "📊 Setting up monitoring for Ticket Hub..."

# Create SNS topic for alerts
echo "📧 Creating SNS topic for alerts..."
SNS_TOPIC_ARN=$(aws sns create-topic \
    --name $SNS_TOPIC_NAME \
    --region $AWS_REGION \
    --query 'TopicArn' \
    --output text)

# Subscribe email to SNS topic
echo "📨 Subscribing email to SNS topic..."
aws sns subscribe \
    --topic-arn $SNS_TOPIC_ARN \
    --protocol email \
    --notification-endpoint $EMAIL_ENDPOINT \
    --region $AWS_REGION

# Create CloudWatch alarms
echo "⚠️ Creating CloudWatch alarms..."

# High CPU utilization alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "ticket-hub-high-cpu" \
    --alarm-description "Alarm when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN \
    --region $AWS_REGION

# High memory utilization alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "ticket-hub-high-memory" \
    --alarm-description "Alarm when memory exceeds 85%" \
    --metric-name MemoryUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 85 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN \
    --region $AWS_REGION

# Service task count alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "ticket-hub-low-task-count" \
    --alarm-description "Alarm when running task count is less than 1" \
    --metric-name RunningTaskCount \
    --namespace AWS/ECS \
    --statistic Average \
    --period 60 \
    --threshold 1 \
    --comparison-operator LessThanThreshold \
    --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
    --evaluation-periods 1 \
    --alarm-actions $SNS_TOPIC_ARN \
    --region $AWS_REGION

# Application Load Balancer target health alarm
LOAD_BALANCER_NAME="ticket-hub-ALB"
TARGET_GROUP_NAME="ticket-hub-TG"

aws cloudwatch put-metric-alarm \
    --alarm-name "ticket-hub-unhealthy-targets" \
    --alarm-description "Alarm when healthy target count is 0" \
    --metric-name HealthyHostCount \
    --namespace AWS/ApplicationELB \
    --statistic Average \
    --period 60 \
    --threshold 1 \
    --comparison-operator LessThanThreshold \
    --dimensions Name=TargetGroup,Value=$TARGET_GROUP_NAME Name=LoadBalancer,Value=$LOAD_BALANCER_NAME \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN \
    --region $AWS_REGION

# Create CloudWatch dashboard
echo "📈 Creating CloudWatch dashboard..."
DASHBOARD_BODY=$(cat << 'EOF'
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/ECS", "CPUUtilization", "ServiceName", "ticket-hub-service", "ClusterName", "ticket-hub-cluster" ],
                    [ ".", "MemoryUtilization", ".", ".", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "ECS Service Utilization",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/ECS", "RunningTaskCount", "ServiceName", "ticket-hub-service", "ClusterName", "ticket-hub-cluster" ],
                    [ ".", "PendingTaskCount", ".", ".", ".", "." ],
                    [ ".", "DesiredCount", ".", ".", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "ECS Task Counts",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/ApplicationELB", "RequestCount", "LoadBalancer", "ticket-hub-ALB" ],
                    [ ".", "TargetResponseTime", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "Load Balancer Metrics",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 6,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", "ticket-hub-TG", "LoadBalancer", "ticket-hub-ALB" ],
                    [ ".", "UnHealthyHostCount", ".", ".", ".", "." ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "title": "Target Health",
                "period": 300
            }
        }
    ]
}
EOF
)

aws cloudwatch put-dashboard \
    --dashboard-name "TicketHub-Dashboard" \
    --dashboard-body "$DASHBOARD_BODY" \
    --region $AWS_REGION

echo "✅ Monitoring setup completed successfully!"
echo ""
echo "📋 Monitoring Summary:"
echo "====================="
echo "• SNS Topic: $SNS_TOPIC_ARN"
echo "• Email Endpoint: $EMAIL_ENDPOINT"
echo "• CloudWatch Alarms: 4 alarms created"
echo "• Dashboard: TicketHub-Dashboard"
echo ""
echo "📧 Check your email to confirm the SNS subscription!"
echo ""
echo "🔍 View your dashboard:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=TicketHub-Dashboard"
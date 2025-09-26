#!/bin/bash

# AWS Deployment Script for Ticket Hub
# This script automates the deployment process to AWS ECS

set -e  # Exit on any error

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPOSITORY_NAME="ticket-hub-app"
CLUSTER_NAME="ticket-hub-cluster"
SERVICE_NAME="ticket-hub-service"
STACK_NAME="ticket-hub-infrastructure"

echo "🚀 Starting AWS deployment for Ticket Hub..."
echo "Region: $AWS_REGION"
echo "Account ID: $AWS_ACCOUNT_ID"

# Step 1: Create ECR repository if it doesn't exist
echo "📦 Setting up ECR repository..."
if ! aws ecr describe-repositories --repository-names $REPOSITORY_NAME --region $AWS_REGION 2>/dev/null; then
    echo "Creating ECR repository..."
    aws ecr create-repository --repository-name $REPOSITORY_NAME --region $AWS_REGION
    echo "✅ ECR repository created successfully"
else
    echo "✅ ECR repository already exists"
fi

# Step 2: Get ECR login token
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 3: Build Docker image
echo "🏗️ Building Docker image..."
docker build -t $REPOSITORY_NAME .
echo "✅ Docker image built successfully"

# Step 4: Tag and push image
echo "⬆️ Pushing image to ECR..."
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPOSITORY_NAME:latest"
docker tag $REPOSITORY_NAME:latest $IMAGE_URI
docker push $IMAGE_URI
echo "✅ Image pushed to ECR: $IMAGE_URI"

# Step 5: Check if CloudFormation stack exists
echo "☁️ Checking CloudFormation stack..."
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION 2>/dev/null; then
    echo "📝 Updating existing CloudFormation stack..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudformation-stack.yml \
        --parameters ParameterKey=ImageURI,ParameterValue=$IMAGE_URI \
        --capabilities CAPABILITY_IAM \
        --region $AWS_REGION
    
    echo "⏳ Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $AWS_REGION
else
    echo "🆕 Creating new CloudFormation stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudformation-stack.yml \
        --parameters ParameterKey=ImageURI,ParameterValue=$IMAGE_URI \
        --capabilities CAPABILITY_IAM \
        --region $AWS_REGION
    
    echo "⏳ Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $AWS_REGION
fi

# Step 6: Get outputs from CloudFormation
echo "📊 Getting deployment information..."
LOAD_BALANCER_DNS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text)

# Step 7: Update ECS service to use new image
echo "🔄 Updating ECS service..."
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $AWS_REGION

echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION

# Step 8: Display success information
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "===================="
echo "• AWS Region: $AWS_REGION"
echo "• ECR Image: $IMAGE_URI"
echo "• CloudFormation Stack: $STACK_NAME"
echo "• ECS Cluster: $CLUSTER_NAME"
echo "• ECS Service: $SERVICE_NAME"
echo "• Load Balancer DNS: $LOAD_BALANCER_DNS"
echo ""
echo "🌐 Your application should be accessible at:"
echo "   http://$LOAD_BALANCER_DNS"
echo ""
echo "📝 Next steps:"
echo "   1. Configure your custom domain (if needed)"
echo "   2. Set up SSL certificate"
echo "   3. Configure monitoring and alerts"
echo "   4. Set up auto-scaling policies"
echo ""
echo "💡 To check service status:"
echo "   aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION"
echo ""
echo "🔍 To view logs:"
echo "   aws logs tail /ecs/ticket-hub-task --follow --region $AWS_REGION"
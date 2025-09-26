# AWS Deployment Guide for Ticket Hub

This guide provides step-by-step instructions for deploying your full-stack Ticket Hub application to AWS using Docker and ECS.

## Prerequisites

Before starting, ensure you have:
- AWS CLI installed and configured
- Docker installed
- An AWS account with appropriate permissions
- Your Supabase project configured

## Deployment Options

### Option 1: ECS Fargate (Recommended)
- Serverless container management
- Automatic scaling
- No server management required

### Option 2: EC2 with Docker Compose
- More control over infrastructure
- Cost-effective for predictable workloads

## Step-by-Step Deployment Process

### Step 1: Prepare Your Environment

1. **Install AWS CLI**
   ```bash
   # macOS
   brew install awscli
   
   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Windows
   # Download and install from https://aws.amazon.com/cli/
   ```

2. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-east-1)
   # Enter output format (json)
   ```

3. **Install Docker**
   - Download from https://docker.com/get-started
   - Verify installation: `docker --version`

### Step 2: Build and Push Docker Image

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name ticket-hub-app --region us-east-1
   ```

2. **Get ECR Login Token**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Build Docker Image**
   ```bash
   docker build -t ticket-hub-app .
   ```

4. **Tag and Push Image**
   ```bash
   docker tag ticket-hub-app:latest <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/ticket-hub-app:latest
   docker push <your-account-id>.dkr.ecr.us-east-1.amazonaws.com/ticket-hub-app:latest
   ```

### Step 3: Deploy with CloudFormation

1. **Deploy Infrastructure**
   ```bash
   aws cloudformation create-stack \
     --stack-name ticket-hub-infrastructure \
     --template-body file://cloudformation-stack.yml \
     --parameters ParameterKey=ImageURI,ParameterValue=<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/ticket-hub-app:latest \
     --capabilities CAPABILITY_IAM
   ```

2. **Monitor Stack Creation**
   ```bash
   aws cloudformation describe-stacks --stack-name ticket-hub-infrastructure
   ```

### Step 4: Alternative - EC2 Deployment

1. **Launch EC2 Instance**
   - Use Amazon Linux 2 AMI
   - t3.medium or larger recommended
   - Configure security group for ports 80, 443, 22

2. **Install Docker on EC2**
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Deploy with Docker Compose**
   ```bash
   # Copy your files to EC2
   scp -i your-key.pem docker-compose.aws.yml ec2-user@your-ec2-ip:/home/ec2-user/
   
   # SSH to EC2 and run
   ssh -i your-key.pem ec2-user@your-ec2-ip
   docker-compose -f docker-compose.aws.yml up -d
   ```

### Step 5: Configure Domain and SSL

1. **Route 53 Domain Setup**
   - Create hosted zone for your domain
   - Update nameservers with your domain registrar

2. **Certificate Manager**
   ```bash
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --subject-alternative-names *.yourdomain.com \
     --validation-method DNS
   ```

3. **Application Load Balancer**
   - Configure ALB with SSL certificate
   - Route traffic to ECS service or EC2 instances

### Step 6: Environment Variables

Set up your environment variables in:
- **ECS**: Task Definition environment variables
- **EC2**: `.env` file or Docker Compose environment section

Required variables:
```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=your-supabase-url
```

### Step 7: Monitoring and Logging

1. **CloudWatch Setup**
   - Monitor application logs
   - Set up alarms for errors
   - Track performance metrics

2. **Health Checks**
   - Configure ECS health checks
   - Set up ALB target health monitoring

## Troubleshooting

### Common Issues:

1. **Image Build Fails**
   - Check Dockerfile syntax
   - Ensure all dependencies are installed
   - Verify network connectivity

2. **Container Won't Start**
   - Check environment variables
   - Review application logs in CloudWatch
   - Verify port configurations

3. **Can't Access Application**
   - Check security group settings
   - Verify load balancer configuration
   - Ensure DNS is properly configured

## Automated Deployment Script

Use the provided `deploy.sh` script for automated deployment:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Cost Optimization

1. **Use Spot Instances** for non-production environments
2. **Configure Auto Scaling** based on CPU/memory usage
3. **Use CloudFront CDN** for static assets
4. **Enable Container Insights** only when needed

## Security Best Practices

1. **Use IAM roles** instead of access keys
2. **Enable VPC Flow Logs**
3. **Use AWS Secrets Manager** for sensitive data
4. **Implement WAF** for additional protection
5. **Regular security updates** for base images

## Backup and Disaster Recovery

1. **Database Backups** (Supabase handles this)
2. **ECS Service Auto Recovery**
3. **Multi-AZ Deployment** for high availability
4. **Regular AMI snapshots** for EC2 deployments

## Next Steps

After successful deployment:
1. Set up monitoring and alerting
2. Configure auto-scaling policies
3. Implement CI/CD pipeline
4. Set up staging environment
5. Configure backup strategies

For support and updates, refer to the AWS documentation and this project's documentation.
#!/bin/bash

# EC2 Setup Script for Ticket Hub
# Run this script on your EC2 instance to set up the environment

set -e

echo "🚀 Setting up EC2 instance for Ticket Hub deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chkconfig docker on

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
echo "☁️ Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/

# Install additional tools
echo "🛠️ Installing additional tools..."
sudo yum install -y git htop curl wget unzip

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/ticket-hub
sudo chown ec2-user:ec2-user /opt/ticket-hub
cd /opt/ticket-hub

# Create environment file template
echo "📝 Creating environment file template..."
cat > .env.template << 'EOF'
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=your-supabase-url

# Notification Configuration (optional)
NOTIFICATION_EMAIL=your-email@domain.com
EOF

echo "✅ EC2 setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables:"
echo "   cp .env.template .env"
echo "   nano .env"
echo ""
echo "2. Log out and log back in for Docker group changes to take effect:"
echo "   exit"
echo ""
echo "3. Upload your deployment files to this directory:"
echo "   /opt/ticket-hub/"
echo ""
echo "4. Run the deployment:"
echo "   docker-compose -f docker-compose.aws.yml up -d"
echo ""
echo "💡 Useful commands:"
echo "   - Check Docker status: sudo service docker status"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart services: docker-compose restart"
echo "   - Update images: docker-compose pull && docker-compose up -d"
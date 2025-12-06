@echo off
echo ========================================
echo EC2 Deployment - Step by Step
echo ========================================
echo.
echo STEP 1: Upload deploy script to EC2
echo.
scp -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" -o StrictHostKeyChecking=no "ec2-deploy.sh" ubuntu@157.175.168.29:~/
echo.
echo STEP 2: Make script executable
echo.
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29 "chmod +x ~/ec2-deploy.sh"
echo.
echo STEP 3: Run deployment script
echo.
ssh -i "C:\Users\TestUser\Desktop\aws\charity-key.pem" ubuntu@157.175.168.29 "~/ec2-deploy.sh"
echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app is live at: http://157.175.168.29
echo.
pause


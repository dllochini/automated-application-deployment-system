This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Deployment Platform Setup (Linux Server)

This guide explains how to set up the deployment platform on a Linux server.
The platform automatically deploys applications from Git repositories using **Jenkins + Docker**.

Supported frameworks:

* React
* Express.js
* FastAPI
* Spring Boot

---

# 1. Server Requirements

Recommended server:

* Ubuntu 22.04 / Debian based Linux
* 4GB RAM minimum
* 20GB disk

Install basic tools:

```bash
sudo apt update
sudo apt install -y git curl
```

---

# 2. Install Docker

Install Docker on the server.

```bash
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
```

Allow Jenkins to use Docker:

```bash
sudo usermod -aG docker jenkins
```

Verify Docker:

```bash
docker --version
```

---

# 3. Install Jenkins

Install Jenkins:

```bash
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install jenkins -y
```

Start Jenkins:

```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Open Jenkins in browser:

```
http://SERVER_IP:8080
```

Get initial admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

# 4. Install Required Jenkins Plugins

Inside Jenkins install:

* Pipeline
* Git
* Docker Pipeline
* Credentials Binding
* AnsiColor

Restart Jenkins after installing plugins.

---

# 5. Configure Jenkins Environment Variables

In Jenkins:

```
Manage Jenkins
→ Configure System
→ Global Properties
→ Environment Variables
```

Add:

```
PLATFORM_HOST=YOUR_SERVER_IP
```

Example:

```
PLATFORM_HOST=192.168.56.101
```

---

# 6. Create Dockerfile Templates

Create a directory:

```bash
sudo mkdir -p /opt/dockerfiles
```

Add Dockerfiles for each framework.

Example:

```
/opt/dockerfiles
  ├── react.Dockerfile
  ├── express.Dockerfile
  ├── fastapi.Dockerfile
  └── springboot.Dockerfile
```

These templates are used by Jenkins to build containers.

---

# 7. Create Jenkins Pipeline Job

In Jenkins:

```
New Item
→ Pipeline
→ Name: deploy-app
```

Enable:

```
This project is parameterized
```

Add parameters:

```
REPO (string)
PORT (string)
PROJECT_ID (string)
ENV (text)
FRAMEWORK (string)
```

Paste the provided **Jenkinsfile pipeline script** in:

```
Pipeline → Pipeline script
```

Save the job.

---

# 8. Deploy the Platform Application

Clone the deployment platform repository.

```bash
git clone https://github.com/YOUR_ORG/deployment-platform.git
cd deployment-platform
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```
.env
```

Example:

```
DATABASE_URL=postgresql://user:password@localhost:5432/deploydb

JENKINS_URL=http://SERVER_IP:8080
JENKINS_USER=admin
JENKINS_TOKEN=YOUR_JENKINS_API_TOKEN
JENKINS_JOB_NAME=deploy-app
```

Run the application:

```bash
npm run build
npm start
```

---

# 9. Configure GitHub Webhook

In the user's GitHub repository:

```
Settings → Webhooks → Add webhook
```

Payload URL:

```
http://YOUR_SERVER/api/webhooks
```

Content type:

```
application/json
```

Events:

```
Just the push event
```

Now every push will trigger a redeployment.

---

# 10. Deployment Flow

When a user deploys a project:

1. User submits repository URL to the platform
2. Platform assigns a free port
3. Platform sends a request to Jenkins
4. Jenkins pipeline:

   * clones repository
   * selects correct Dockerfile
   * builds Docker image
   * runs container
5. Application becomes available at:

```
http://SERVER_IP:PORT
```

Example:

```
http://192.168.56.101:3001
```

---

# 11. Managing Running Containers

List running apps:

```bash
docker ps
```

Stop container:

```bash
docker stop CONTAINER_ID
```

Remove container:

```bash
docker rm CONTAINER_ID
```

---

# 12. Troubleshooting

### Jenkins cannot run Docker

Restart Jenkins after adding docker group:

```bash
sudo systemctl restart jenkins
```

### Container port already in use

Check used ports:

```bash
sudo lsof -i -P -n | grep LISTEN
```

### Pipeline build failed

Check logs in:

```
Jenkins → Build → Console Output
```

---

# 13. Security Notes

Recommended improvements for production:

* Add HTTPS using Nginx
* Use a firewall
* Store secrets using Jenkins Credentials
* Verify GitHub webhook signatures

---

# 14. Summary

This platform provides a simple **mini PaaS** where:

* Developers push code to Git
* Jenkins builds Docker images
* Containers run automatically
* Apps become available via assigned ports

Supported frameworks:

* React
* Express
* FastAPI
* Spring Boot

---

END

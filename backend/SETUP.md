## Backend Setup (AWS SAM) ⚙️

### Prerequisites

Before running the backend, you need the following installed and configured:

1. **AWS Account** — Noel should've made u one

2. **AWS CLI** — Used to configure credentials
   - [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
   - After installing, configure a profile for this project:

     ```bash
     aws configure --profile housemates
     ```

     !! Make sure it is housemates, the setup explicitly looks for this profile
     Enter your Access Key ID, Secret Access Key, and region (`us-east-2`) when prompted.

3. **AWS SAM CLI** — Used to build, test, and deploy the backend
   - **Mac**

     ```bash
     xcode-select --install
     brew install aws-sam-cli
     ```

   - **Windows**
     figure it out lol

   - Verify installation: `sam --version`

4. **Node.js** (v24) — [Download here](https://nodejs.org/en/download/prebuilt-installer)

5. **Docker** — Required for local testing only
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Make sure Docker is **running** before using `sam local`

> **Mac note:** If you get a permission error running `sam`, try reopening your terminal or running `which sam` to confirm it's on your PATH.

---

### Configuration

Copy the example config and fill in your values:

```bash
cp backend/samconfig.toml.example backend/samconfig.toml
```

Open `backend/samconfig.toml` and replace all `<placeholder>` values with your actual AWS resource IDs. This file is gitignored — **do not commit it.**

---

### Build

Compiles and bundles the TypeScript Lambda functions:

```bash
cd backend
sam build --profile housemates
```

Run this every time you change function code before testing locally or deploying.

---

### Test Locally

Starts a local API Gateway server at `http://localhost:3000`:

```bash
cd backend
sam local start-api --profile housemates
```

- DynamoDB calls still hit the real AWS — make sure your credentials are set up
- **Docker must be running**

---

### Deploy to AWS

Builds and pushes everything to the cloud:

```bash
cd backend
sam build --profile housemates && sam deploy --profile housemates
```

On first deploy, you'll see a changeset preview showing what resources will be created. Confirm to proceed. The API URL will be printed in the Outputs section when done.

# hello-aws4

Example demonstrating how to create an AWS architecture diagram using the drawio-jsapi SDK with AWS4 icons.

## What It Creates

A 3-tier AWS architecture with:

- AWS Cloud and Region containers
- VPC with public and private subnets
- Compute services: EC2, Lambda
- Networking: Internet Gateway, API Gateway, ALB
- Data services: RDS, DynamoDB, S3, ElastiCache
- Monitoring: CloudWatch
- Service connections

## Running

```bash
npm install
npm start
```

Output: `output/aws-architecture.drawio`

## Key Concepts Demonstrated

- Using `api.cells.insertAwsGroup()` for AWS containers (VPC, subnets, etc.)
- Using `api.cells.insertAwsIcon()` for AWS service icons
- Using `buildResourceIconStyle()` for custom AWS icon styles
- Accessing available icons via `AWS4_ICONS` constant
- Listing group types with `api.cells.getAwsGroupTypes()`

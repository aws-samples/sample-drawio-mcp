#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
/**
 * @file hello-aws4.js
 * @description Example script that creates an AWS architecture diagram using DrawioAPI
 *
 * This demonstrates how to use the DrawioAPI with AWS4 icons programmatically in Node.js
 * to generate draw.io XML files with proper AWS architecture icons.
 *
 * The example creates a typical 3-tier AWS architecture:
 * - AWS Cloud container with Region
 * - VPC with public and private subnets
 * - API Gateway, Lambda, EC2 in public subnet
 * - RDS, S3 in private subnet
 * - Connections between services
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

// Import from drawio-jsapi package
import {
  DiagramEngine,
  buildResourceIconStyle,
  AWS4_ICONS,
  setupGlobalMocks,
} from "drawio-jsapi";

// Setup global mocks (initializes mxConstants, mxUtils, etc. for Node.js)
setupGlobalMocks();

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================================
// Main Example: Create an AWS Architecture Diagram
// ============================================================================

function main() {
  console.log("Creating AWS architecture diagram using DrawioAPI...\n");

  // Create DiagramEngine - handles all setup and serialization
  const engine = new DiagramEngine();
  const result = engine.create({ name: "AWS Architecture" });

  if (!result.success) {
    console.error("Failed to create diagram:", result.error);
    return;
  }

  const api = engine.api;

  console.log("Diagram created:", result.data.name);
  console.log("");

  // -------------------------------------------------------------------------
  // Create AWS Container Groups
  // -------------------------------------------------------------------------

  console.log("Creating AWS container groups...");

  // AWS Cloud container (outermost)
  const awsCloud = api.cells.insertAwsGroup({
    id: "aws-cloud",
    groupType: "awsCloud",
    label: "AWS Cloud",
    geometry: { x: 20, y: 20, width: 860, height: 560 },
  });
  console.log(`  - Created: AWS Cloud (${awsCloud.data.id})`);

  // Region
  const region = api.cells.insertAwsGroup({
    id: "region",
    groupType: "region",
    label: "us-east-1",
    geometry: { x: 40, y: 60, width: 820, height: 500 },
  });
  console.log(`  - Created: Region (${region.data.id})`);

  // VPC
  const vpc = api.cells.insertAwsGroup({
    id: "vpc",
    groupType: "vpc",
    label: "VPC (10.0.0.0/16)",
    geometry: { x: 60, y: 100, width: 780, height: 440 },
  });
  console.log(`  - Created: VPC (${vpc.data.id})`);

  // Public Subnet
  const publicSubnet = api.cells.insertAwsGroup({
    id: "public-subnet",
    groupType: "publicSubnet",
    label: "Public Subnet (10.0.1.0/24)",
    geometry: { x: 80, y: 140, width: 360, height: 380 },
  });
  console.log(`  - Created: Public Subnet (${publicSubnet.data.id})`);

  // Private Subnet
  const privateSubnet = api.cells.insertAwsGroup({
    id: "private-subnet",
    groupType: "privateSubnet",
    label: "Private Subnet (10.0.2.0/24)",
    geometry: { x: 460, y: 140, width: 360, height: 380 },
  });
  console.log(`  - Created: Private Subnet (${privateSubnet.data.id})`);

  // -------------------------------------------------------------------------
  // Add AWS Service Icons
  // -------------------------------------------------------------------------

  console.log("\nAdding AWS service icons...");

  // --- Public Subnet Services ---

  // Internet Gateway (at the top)
  const igw = api.cells.insertAwsIcon({
    id: "igw",
    icon: "internetGateway",
    category: "networking",
    label: "Internet\nGateway",
    geometry: { x: 230, y: 160, width: 78, height: 78 },
  });
  console.log(`  - Created: Internet Gateway (${igw.data.id})`);

  // API Gateway
  const apiGw = api.cells.insertAwsIcon({
    id: "api-gateway",
    icon: "apiGateway",
    category: "networking",
    label: "API Gateway",
    geometry: { x: 120, y: 280, width: 78, height: 78 },
  });
  console.log(`  - Created: API Gateway (${apiGw.data.id})`);

  // Lambda Function
  const lambda = api.cells.insertAwsIcon({
    id: "lambda",
    icon: "lambda",
    category: "compute",
    label: "Lambda",
    geometry: { x: 120, y: 400, width: 78, height: 78 },
  });
  console.log(`  - Created: Lambda (${lambda.data.id})`);

  // EC2 Instance
  const ec2 = api.cells.insertAwsIcon({
    id: "ec2",
    icon: "ec2",
    category: "compute",
    label: "EC2",
    geometry: { x: 280, y: 340, width: 78, height: 78 },
  });
  console.log(`  - Created: EC2 (${ec2.data.id})`);

  // Application Load Balancer
  const alb = api.cells.insertAwsIcon({
    id: "alb",
    icon: "applicationLoadBalancer",
    category: "networking",
    label: "ALB",
    geometry: { x: 280, y: 200, width: 78, height: 78 },
  });
  console.log(`  - Created: ALB (${alb.data.id})`);

  // --- Private Subnet Services ---

  // RDS Database
  const rds = api.cells.insertAwsIcon({
    id: "rds",
    icon: "rds",
    category: "database",
    label: "RDS\nPostgreSQL",
    geometry: { x: 520, y: 200, width: 78, height: 78 },
  });
  console.log(`  - Created: RDS (${rds.data.id})`);

  // DynamoDB
  const dynamodb = api.cells.insertAwsIcon({
    id: "dynamodb",
    icon: "dynamodb",
    category: "database",
    label: "DynamoDB",
    geometry: { x: 680, y: 200, width: 78, height: 78 },
  });
  console.log(`  - Created: DynamoDB (${dynamodb.data.id})`);

  // S3 Bucket
  const s3 = api.cells.insertAwsIcon({
    id: "s3",
    icon: "s3",
    category: "storage",
    label: "S3 Bucket",
    geometry: { x: 600, y: 340, width: 78, height: 78 },
  });
  console.log(`  - Created: S3 (${s3.data.id})`);

  // ElastiCache
  const elasticache = api.cells.insertAwsIcon({
    id: "elasticache",
    icon: "elasticache",
    category: "database",
    label: "ElastiCache",
    geometry: { x: 600, y: 450, width: 78, height: 78 },
  });
  console.log(`  - Created: ElastiCache (${elasticache.data.id})`);

  // CloudWatch (outside subnets, in region)
  const cloudwatch = api.cells.insertAwsIcon({
    id: "cloudwatch",
    icon: "cloudWatch",
    category: "managementGovernance",
    label: "CloudWatch",
    geometry: { x: 760, y: 60, width: 60, height: 60 },
  });
  console.log(`  - Created: CloudWatch (${cloudwatch.data.id})`);

  // -------------------------------------------------------------------------
  // Add User/Client Icon (outside AWS Cloud)
  // -------------------------------------------------------------------------

  // Users icon (demonstrates using style pass-through - KISS 3)
  const userStyleString = buildResourceIconStyle("users", {
    fillColor: "#232F3D",
  });
  const users = api.cells.insertAwsIcon({
    id: "users",
    style: userStyleString, // KISS 3: Direct style pass-through
    label: "Users",
    geometry: { x: 230, y: 600, width: 78, height: 78 },
  });
  console.log(
    `  - Created: Users (${users.data.id}) - using style pass-through`,
  );

  // -------------------------------------------------------------------------
  // Create Connections
  // -------------------------------------------------------------------------

  console.log("\nAdding connections...");

  const edgeStyle = {
    edgeStyle: "orthogonalEdgeStyle",
    rounded: 0,
    orthogonalLoop: 1,
    jettySize: "auto",
    html: 1,
    strokeColor: "#545B64",
    strokeWidth: 2,
  };

  // Users -> Internet Gateway
  const e1 = api.cells.insertEdge({
    sourceId: "users",
    targetId: "igw",
    style: edgeStyle,
  });
  console.log(`  - Connected: Users -> Internet Gateway (${e1.data.id})`);

  // Internet Gateway -> ALB
  const e2 = api.cells.insertEdge({
    sourceId: "igw",
    targetId: "alb",
    style: edgeStyle,
  });
  console.log(`  - Connected: Internet Gateway -> ALB (${e2.data.id})`);

  // ALB -> EC2
  const e3 = api.cells.insertEdge({
    sourceId: "alb",
    targetId: "ec2",
    style: edgeStyle,
  });
  console.log(`  - Connected: ALB -> EC2 (${e3.data.id})`);

  // Internet Gateway -> API Gateway
  const e4 = api.cells.insertEdge({
    sourceId: "igw",
    targetId: "api-gateway",
    style: edgeStyle,
  });
  console.log(`  - Connected: Internet Gateway -> API Gateway (${e4.data.id})`);

  // API Gateway -> Lambda
  const e5 = api.cells.insertEdge({
    sourceId: "api-gateway",
    targetId: "lambda",
    style: edgeStyle,
  });
  console.log(`  - Connected: API Gateway -> Lambda (${e5.data.id})`);

  // Lambda -> RDS
  const e6 = api.cells.insertEdge({
    sourceId: "lambda",
    targetId: "rds",
    style: edgeStyle,
  });
  console.log(`  - Connected: Lambda -> RDS (${e6.data.id})`);

  // Lambda -> DynamoDB
  const e7 = api.cells.insertEdge({
    sourceId: "lambda",
    targetId: "dynamodb",
    style: edgeStyle,
  });
  console.log(`  - Connected: Lambda -> DynamoDB (${e7.data.id})`);

  // Lambda -> S3
  const e8 = api.cells.insertEdge({
    sourceId: "lambda",
    targetId: "s3",
    style: edgeStyle,
  });
  console.log(`  - Connected: Lambda -> S3 (${e8.data.id})`);

  // EC2 -> RDS
  const e9 = api.cells.insertEdge({
    sourceId: "ec2",
    targetId: "rds",
    style: edgeStyle,
  });
  console.log(`  - Connected: EC2 -> RDS (${e9.data.id})`);

  // EC2 -> ElastiCache
  const e10 = api.cells.insertEdge({
    sourceId: "ec2",
    targetId: "elasticache",
    style: edgeStyle,
  });
  console.log(`  - Connected: EC2 -> ElastiCache (${e10.data.id})`);

  // -------------------------------------------------------------------------
  // Get diagram info
  // -------------------------------------------------------------------------

  console.log("\nDiagram Statistics:");
  const info = engine.getInfo();
  console.log(`  - Total cells: ${info.data.cellCount}`);
  console.log(`  - Vertices: ${info.data.vertexCount}`);
  console.log(`  - Edges: ${info.data.edgeCount}`);

  // -------------------------------------------------------------------------
  // Save to file using DiagramEngine
  // -------------------------------------------------------------------------

  console.log("\nExporting diagram...");

  const outputDir = join(__dirname, "output");
  const outputPath = join(outputDir, "aws-architecture.drawio");

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const saveResult = engine.saveToFile(outputPath);

  if (!saveResult.success) {
    console.error("Failed to save:", saveResult.error);
    return;
  }

  console.log(`\nDiagram saved to: ${outputPath}`);
  console.log("\nOpen the file with:");
  console.log("  - https://app.diagrams.net/");
  console.log("  - VS Code with Draw.io Integration extension");
  console.log("  - draw.io Desktop app");

  // -------------------------------------------------------------------------
  // Show available icons info
  // -------------------------------------------------------------------------

  console.log("\n--- Available AWS4 Icons ---");
  console.log("Categories:", Object.keys(AWS4_ICONS).join(", "));
  console.log("\nCompute icons:", Object.keys(AWS4_ICONS.compute).join(", "));
  console.log("Database icons:", Object.keys(AWS4_ICONS.database).join(", "));
  console.log("Storage icons:", Object.keys(AWS4_ICONS.storage).join(", "));
  console.log(
    "Networking icons:",
    Object.keys(AWS4_ICONS.networking).join(", "),
  );

  console.log("\n--- Available Group Types ---");
  const groupTypes = api.cells.getAwsGroupTypes();
  console.log(groupTypes.data.map((g) => `${g.type} (${g.name})`).join(", "));
}

// Run the example
main();

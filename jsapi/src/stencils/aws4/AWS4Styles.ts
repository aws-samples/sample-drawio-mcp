// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * @file AWS4Styles.ts - AWS4 icon style constants and builders
 * @description Provides style constants and builder functions for AWS4 icons.
 * Extracted from Sidebar-AWS4.js for programmatic use.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Icon definition for an AWS4 service icon.
 */
export interface AWS4IconDefinition {
  name: string;
  icon: string;
  fillColor: string;
  width: number;
  height: number;
}

/**
 * Icon lookup result including category information.
 */
export interface AWS4IconLookupResult extends AWS4IconDefinition {
  key: string;
  category: string;
}

/**
 * Group container definition for AWS4.
 */
export interface AWS4GroupDefinition {
  name: string;
  grIcon?: string;
  strokeColor: string;
  fillColor: string;
  fontColor: string;
  dashed: boolean;
  simple?: boolean;
  grStroke?: number;
  centered?: boolean;
}

/**
 * Options for building resource icon styles.
 */
export interface ResourceIconStyleOptions {
  fillColor?: string;
}

/**
 * Options for building product icon styles.
 */
export interface ProductIconStyleOptions {
  fillColor?: string;
}

/**
 * Options for building group styles.
 */
export interface GroupStyleOptions {
  strokeColor?: string;
  fillColor?: string;
  fontColor?: string;
}

/**
 * Style object parsed from style string.
 */
export type StyleObject = Record<string, string | number | undefined>;

/**
 * AWS4 icon category with icon definitions.
 */
export type AWS4IconCategory = Record<string, AWS4IconDefinition>;

// ============================================================================
// BASE STYLES
// ============================================================================

/**
 * Base style patterns for AWS4 shapes.
 * These are the foundational style strings used to build AWS4 icon styles.
 */
export const AWS4_BASE = {
  /**
   * Base style for resource icons (the main AWS service icons).
   * Used with resourceIcon shape type.
   */
  RESOURCE_ICON:
    "sketch=0;points=[[0,0,0],[0.25,0,0],[0.5,0,0],[0.75,0,0],[1,0,0]," +
    "[0,1,0],[0.25,1,0],[0.5,1,0],[0.75,1,0],[1,1,0],[0,0.25,0],[0,0.5,0]," +
    "[0,0.75,0],[1,0.25,0],[1,0.5,0],[1,0.75,0]];outlineConnect=0;fontColor=#232F3E;" +
    "strokeColor=#ffffff;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;" +
    "align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.",

  /**
   * Base style for product icons (simpler icons without the border).
   */
  PRODUCT_ICON:
    "sketch=0;outlineConnect=0;fontColor=#232F3E;gradientColor=none;" +
    "strokeColor=none;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;" +
    "align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;pointerEvents=1;shape=mxgraph.aws4.",

  /**
   * Base style for group containers (VPC, Region, Subnet, etc.).
   */
  GROUP:
    "points=[[0,0],[0.25,0],[0.5,0],[0.75,0],[1,0],[1,0.25],[1,0.5],[1,0.75]," +
    "[1,1],[0.75,1],[0.5,1],[0.25,1],[0,1],[0,0.75],[0,0.5],[0,0.25]];" +
    "outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;" +
    "fontStyle=0;container=1;pointerEvents=0;collapsible=0;recursiveResize=0;" +
    "shape=mxgraph.aws4.",

  /**
   * Base style for illustration icons.
   */
  ILLUSTRATION:
    "sketch=0;outlineConnect=0;gradientColor=none;fontColor=#545B64;" +
    "strokeColor=none;fillColor=#879196;dashed=0;verticalLabelPosition=bottom;" +
    "verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.",
} as const;

// ============================================================================
// COLORS
// ============================================================================

/**
 * AWS service category colors.
 * These are the official AWS color codes for each service category.
 */
export const AWS4_COLORS = {
  // Category colors
  analytics: "#8C4FFF",
  applicationIntegration: "#E7157B",
  blockchain: "#D45B07",
  businessApplications: "#C925D1",
  cloudFinancial: "#7AA116",
  compute: "#ED7100",
  contactCenter: "#E7157B",
  containers: "#ED7100",
  database: "#3B48CC",
  developerTools: "#3B48CC",
  endUserComputing: "#5F9EA0",
  frontEndWebMobile: "#DD344C",
  games: "#DD344C",
  iot: "#7AA116",
  machineLearning: "#01A88D",
  managementGovernance: "#E7157B",
  mediaServices: "#ED7100",
  migration: "#7AA116",
  networking: "#8C4FFF",
  quantumTechnologies: "#8C4FFF",
  robotics: "#DD344C",
  satellite: "#8C4FFF",
  security: "#DD344C",
  serverless: "#ED7100",
  storage: "#7AA116",

  // General colors
  general: "#232F3D",
  dark: "#1E262E",
  white: "#ffffff",
  gray: "#5A6C86",
} as const;

// ============================================================================
// ICONS
// ============================================================================

/**
 * Comprehensive AWS4 icon catalog organized by category.
 * Each icon includes: name, icon identifier, fill color, and default dimensions.
 */
export const AWS4_ICONS: Record<string, AWS4IconCategory> = {
  // ============================================================================
  // COMPUTE
  // ============================================================================
  compute: {
    ec2: {
      name: "EC2",
      icon: "ec2",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    lambda: {
      name: "Lambda",
      icon: "lambda",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ecs: {
      name: "ECS",
      icon: "ecs",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    eks: {
      name: "EKS",
      icon: "eks",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    fargate: {
      name: "Fargate",
      icon: "fargate",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    batch: {
      name: "Batch",
      icon: "batch",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    elasticBeanstalk: {
      name: "Elastic Beanstalk",
      icon: "elastic_beanstalk",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    lightsail: {
      name: "Lightsail",
      icon: "lightsail",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    outposts: {
      name: "Outposts",
      icon: "outposts",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    serverlessApplicationRepository: {
      name: "SAR",
      icon: "serverless_application_repository",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    wavelength: {
      name: "Wavelength",
      icon: "wavelength",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    localZones: {
      name: "Local Zones",
      icon: "local_zones",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    appRunner: {
      name: "App Runner",
      icon: "app_runner",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    // EC2 instance types
    ec2Instance: {
      name: "EC2 Instance",
      icon: "instance",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ec2Instances: {
      name: "EC2 Instances",
      icon: "instances",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ec2Ami: {
      name: "AMI",
      icon: "ami",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ec2AutoScaling: {
      name: "Auto Scaling",
      icon: "auto_scaling2",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    elasticIpAddress: {
      name: "Elastic IP",
      icon: "elastic_ip_address",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    spotInstance: {
      name: "Spot Instance",
      icon: "spot_instance",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // DATABASE
  // ============================================================================
  database: {
    rds: {
      name: "RDS",
      icon: "rds",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    aurora: {
      name: "Aurora",
      icon: "aurora",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    dynamodb: {
      name: "DynamoDB",
      icon: "dynamodb",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    elasticache: {
      name: "ElastiCache",
      icon: "elasticache",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    neptune: {
      name: "Neptune",
      icon: "neptune",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    redshift: {
      name: "Redshift",
      icon: "redshift",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    documentdb: {
      name: "DocumentDB",
      icon: "documentdb",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    keyspaces: {
      name: "Keyspaces",
      icon: "keyspaces",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    qldb: {
      name: "QLDB",
      icon: "qldb",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    timestream: {
      name: "Timestream",
      icon: "timestream",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    memorydb: {
      name: "MemoryDB",
      icon: "memorydb",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    // Database specific icons
    rdsInstance: {
      name: "RDS Instance",
      icon: "rds_instance",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    rdsMysql: {
      name: "RDS MySQL",
      icon: "rds_mysql_instance",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    rdsPostgresql: {
      name: "RDS PostgreSQL",
      icon: "rds_postgresql_instance",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    dynamodbTable: {
      name: "DynamoDB Table",
      icon: "table",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    dynamodbItems: {
      name: "DynamoDB Items",
      icon: "items",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    dynamodbAttribute: {
      name: "DynamoDB Attribute",
      icon: "attribute",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // STORAGE
  // ============================================================================
  storage: {
    s3: { name: "S3", icon: "s3", fillColor: "#7AA116", width: 78, height: 78 },
    efs: {
      name: "EFS",
      icon: "elastic_file_system",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    ebs: {
      name: "EBS",
      icon: "elastic_block_store",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    fsx: {
      name: "FSx",
      icon: "fsx",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    glacier: {
      name: "S3 Glacier",
      icon: "s3_glacier",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    storageGateway: {
      name: "Storage Gateway",
      icon: "storage_gateway",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    backup: {
      name: "Backup",
      icon: "backup",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    snowball: {
      name: "Snowball",
      icon: "snowball",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    snowballEdge: {
      name: "Snowball Edge",
      icon: "snowball_edge",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    snowcone: {
      name: "Snowcone",
      icon: "snowcone",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    snowmobile: {
      name: "Snowmobile",
      icon: "snowmobile",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    // S3 specific icons
    s3Bucket: {
      name: "S3 Bucket",
      icon: "bucket",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    s3BucketWithObjects: {
      name: "S3 Bucket Objects",
      icon: "bucket_with_objects",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    s3Object: {
      name: "S3 Object",
      icon: "object",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    s3GlacierArchive: {
      name: "Glacier Archive",
      icon: "archive",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    s3GlacierVault: {
      name: "Glacier Vault",
      icon: "vault",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // NETWORKING
  // ============================================================================
  networking: {
    vpc: {
      name: "VPC",
      icon: "vpc",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    cloudfront: {
      name: "CloudFront",
      icon: "cloudfront",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    route53: {
      name: "Route 53",
      icon: "route_53",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    apiGateway: {
      name: "API Gateway",
      icon: "api_gateway",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    directConnect: {
      name: "Direct Connect",
      icon: "direct_connect",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    globalAccelerator: {
      name: "Global Accelerator",
      icon: "global_accelerator",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    transitGateway: {
      name: "Transit Gateway",
      icon: "transit_gateway",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    elb: {
      name: "ELB",
      icon: "elastic_load_balancing",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    privateLink: {
      name: "PrivateLink",
      icon: "privatelink",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    appMesh: {
      name: "App Mesh",
      icon: "app_mesh",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    cloudMap: {
      name: "Cloud Map",
      icon: "cloud_map",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    // VPC specific icons
    internetGateway: {
      name: "Internet Gateway",
      icon: "internet_gateway",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    natGateway: {
      name: "NAT Gateway",
      icon: "nat_gateway",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    vpnGateway: {
      name: "VPN Gateway",
      icon: "vpn_gateway",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    customerGateway: {
      name: "Customer Gateway",
      icon: "customer_gateway",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    vpnConnection: {
      name: "VPN Connection",
      icon: "vpn_connection",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    routeTable: {
      name: "Route Table",
      icon: "route_table",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    networkAcl: {
      name: "Network ACL",
      icon: "network_access_control_list",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    securityGroup: {
      name: "Security Group",
      icon: "security_group",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    elasticNetworkInterface: {
      name: "ENI",
      icon: "elastic_network_interface",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    endpoints: {
      name: "Endpoints",
      icon: "endpoints",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    // Load balancer types
    applicationLoadBalancer: {
      name: "ALB",
      icon: "application_load_balancer",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    networkLoadBalancer: {
      name: "NLB",
      icon: "network_load_balancer",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    classicLoadBalancer: {
      name: "CLB",
      icon: "classic_load_balancer",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    gatewayLoadBalancer: {
      name: "GWLB",
      icon: "gateway_load_balancer",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // SECURITY
  // ============================================================================
  security: {
    iam: {
      name: "IAM",
      icon: "iam",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    cognito: {
      name: "Cognito",
      icon: "cognito",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    secretsManager: {
      name: "Secrets Manager",
      icon: "secrets_manager",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    kms: {
      name: "KMS",
      icon: "key_management_service",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    shield: {
      name: "Shield",
      icon: "shield",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    waf: {
      name: "WAF",
      icon: "waf",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    guardDuty: {
      name: "GuardDuty",
      icon: "guardduty",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    inspector: {
      name: "Inspector",
      icon: "inspector",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    macie: {
      name: "Macie",
      icon: "macie",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    securityHub: {
      name: "Security Hub",
      icon: "security_hub",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    detective: {
      name: "Detective",
      icon: "detective",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    firewall: {
      name: "Network Firewall",
      icon: "network_firewall",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    firewallManager: {
      name: "Firewall Manager",
      icon: "firewall_manager",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    certificateManager: {
      name: "ACM",
      icon: "certificate_manager",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    cloudhsm: {
      name: "CloudHSM",
      icon: "cloudhsm",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    directoryService: {
      name: "Directory Service",
      icon: "directory_service",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    sso: {
      name: "IAM Identity Center",
      icon: "single_sign_on",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    ram: {
      name: "RAM",
      icon: "resource_access_manager",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    artifact: {
      name: "Artifact",
      icon: "artifact",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    auditManager: {
      name: "Audit Manager",
      icon: "audit_manager",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    signer: {
      name: "Signer",
      icon: "signer",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    // IAM specific
    iamRole: {
      name: "IAM Role",
      icon: "role",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    iamPermissions: {
      name: "IAM Permissions",
      icon: "permissions",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
    iamDataEncryptionKey: {
      name: "Data Encryption Key",
      icon: "data_encryption_key",
      fillColor: "#DD344C",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // APPLICATION INTEGRATION
  // ============================================================================
  applicationIntegration: {
    sns: {
      name: "SNS",
      icon: "sns",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    sqs: {
      name: "SQS",
      icon: "sqs",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    eventBridge: {
      name: "EventBridge",
      icon: "eventbridge",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    stepFunctions: {
      name: "Step Functions",
      icon: "step_functions",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    appSync: {
      name: "AppSync",
      icon: "appsync",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    mq: { name: "MQ", icon: "mq", fillColor: "#E7157B", width: 78, height: 78 },
    appFlow: {
      name: "AppFlow",
      icon: "appflow",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    managedWorkflows: {
      name: "Managed Workflows",
      icon: "managed_workflows_for_apache_airflow",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    // SNS/SQS specific
    snsTopic: {
      name: "SNS Topic",
      icon: "topic",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    snsEmailNotification: {
      name: "Email Notification",
      icon: "email_notification",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    sqsQueue: {
      name: "SQS Queue",
      icon: "queue",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    sqsMessage: {
      name: "SQS Message",
      icon: "message",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================
  analytics: {
    athena: {
      name: "Athena",
      icon: "athena",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    emr: {
      name: "EMR",
      icon: "emr",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    kinesis: {
      name: "Kinesis",
      icon: "kinesis",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    kinesisDataStreams: {
      name: "Kinesis Data Streams",
      icon: "kinesis_data_streams",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    kinesisDataFirehose: {
      name: "Kinesis Firehose",
      icon: "kinesis_data_firehose",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    kinesisDataAnalytics: {
      name: "Kinesis Analytics",
      icon: "kinesis_data_analytics",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    kinesisVideoStreams: {
      name: "Kinesis Video",
      icon: "kinesis_video_streams",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    glue: {
      name: "Glue",
      icon: "glue",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    glueDataBrew: {
      name: "Glue DataBrew",
      icon: "glue_databrew",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    lakeFormation: {
      name: "Lake Formation",
      icon: "lake_formation",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    quickSight: {
      name: "QuickSight",
      icon: "quicksight",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    dataExchange: {
      name: "Data Exchange",
      icon: "data_exchange",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    dataPipeline: {
      name: "Data Pipeline",
      icon: "data_pipeline",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    openSearch: {
      name: "OpenSearch",
      icon: "elasticsearch_service",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    cloudSearch: {
      name: "CloudSearch",
      icon: "cloudsearch2",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
    msk: {
      name: "MSK",
      icon: "managed_streaming_for_kafka",
      fillColor: "#8C4FFF",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // MANAGEMENT & GOVERNANCE
  // ============================================================================
  managementGovernance: {
    cloudWatch: {
      name: "CloudWatch",
      icon: "cloudwatch",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    cloudTrail: {
      name: "CloudTrail",
      icon: "cloudtrail",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    config: {
      name: "Config",
      icon: "config",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    cloudFormation: {
      name: "CloudFormation",
      icon: "cloudformation",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    systemsManager: {
      name: "Systems Manager",
      icon: "systems_manager",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    serviceCatalog: {
      name: "Service Catalog",
      icon: "service_catalog",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    trustedAdvisor: {
      name: "Trusted Advisor",
      icon: "trusted_advisor",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    controlTower: {
      name: "Control Tower",
      icon: "control_tower",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    organizations: {
      name: "Organizations",
      icon: "organizations",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    opsWorks: {
      name: "OpsWorks",
      icon: "opsworks",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    licenseManager: {
      name: "License Manager",
      icon: "license_manager",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    wellArchitected: {
      name: "Well-Architected",
      icon: "well_architected_tool",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    personalHealthDashboard: {
      name: "Health Dashboard",
      icon: "personal_health_dashboard",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    managementConsole: {
      name: "Management Console",
      icon: "management_console",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    appConfig: {
      name: "AppConfig",
      icon: "appconfig",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    // CloudWatch specific
    cloudWatchAlarm: {
      name: "CloudWatch Alarm",
      icon: "alarm",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    cloudWatchRule: {
      name: "CloudWatch Rule",
      icon: "rule",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
    cloudWatchLogs: {
      name: "CloudWatch Logs",
      icon: "logs",
      fillColor: "#E7157B",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // DEVELOPER TOOLS
  // ============================================================================
  developerTools: {
    codeCommit: {
      name: "CodeCommit",
      icon: "codecommit",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    codeBuild: {
      name: "CodeBuild",
      icon: "codebuild",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    codeDeploy: {
      name: "CodeDeploy",
      icon: "codedeploy",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    codePipeline: {
      name: "CodePipeline",
      icon: "codepipeline",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    codeArtifact: {
      name: "CodeArtifact",
      icon: "codeartifact",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    codeStar: {
      name: "CodeStar",
      icon: "codestar",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    cloud9: {
      name: "Cloud9",
      icon: "cloud9",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    xRay: {
      name: "X-Ray",
      icon: "xray",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    cli: {
      name: "CLI",
      icon: "command_line_interface",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
    toolsAndSdks: {
      name: "Tools and SDKs",
      icon: "tools_and_sdks",
      fillColor: "#3B48CC",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // MACHINE LEARNING / AI
  // ============================================================================
  machineLearning: {
    sagemaker: {
      name: "SageMaker",
      icon: "sagemaker",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    sagemaker2: {
      name: "SageMaker",
      icon: "sagemaker_2",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    rekognition: {
      name: "Rekognition",
      icon: "rekognition",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    polly: {
      name: "Polly",
      icon: "polly",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    lex: {
      name: "Lex",
      icon: "lex",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    transcribe: {
      name: "Transcribe",
      icon: "transcribe",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    translate: {
      name: "Translate",
      icon: "translate",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    comprehend: {
      name: "Comprehend",
      icon: "comprehend",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    textract: {
      name: "Textract",
      icon: "textract",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    forecast: {
      name: "Forecast",
      icon: "forecast",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    personalize: {
      name: "Personalize",
      icon: "personalize",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    kendra: {
      name: "Kendra",
      icon: "kendra",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    codeWhisperer: {
      name: "CodeWhisperer",
      icon: "codewhisperer",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    bedrock: {
      name: "Bedrock",
      icon: "bedrock",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
    q: {
      name: "Amazon Q",
      icon: "q",
      fillColor: "#01A88D",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // IOT
  // ============================================================================
  iot: {
    iotCore: {
      name: "IoT Core",
      icon: "iot_core",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotGreengrass: {
      name: "IoT Greengrass",
      icon: "iot_greengrass",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotAnalytics: {
      name: "IoT Analytics",
      icon: "iot_analytics",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotEvents: {
      name: "IoT Events",
      icon: "iot_events",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotSiteWise: {
      name: "IoT SiteWise",
      icon: "iot_sitewise",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotThingsGraph: {
      name: "IoT Things Graph",
      icon: "iot_things_graph",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotDeviceDefender: {
      name: "IoT Device Defender",
      icon: "iot_device_defender",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotDeviceManagement: {
      name: "IoT Device Management",
      icon: "iot_device_management",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
    iotButton: {
      name: "IoT Button",
      icon: "iot_button",
      fillColor: "#7AA116",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // CONTAINERS
  // ============================================================================
  containers: {
    ecr: {
      name: "ECR",
      icon: "ecr",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ecrImage: {
      name: "ECR Image",
      icon: "ecr_image",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ecrRegistry: {
      name: "ECR Registry",
      icon: "ecr_registry",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ecsService: {
      name: "ECS Service",
      icon: "ecs_service",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ecsTask: {
      name: "ECS Task",
      icon: "ecs_task",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    ecsContainer: {
      name: "ECS Container",
      icon: "container",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
    eksCloud: {
      name: "EKS Cloud",
      icon: "eks_cloud",
      fillColor: "#ED7100",
      width: 78,
      height: 78,
    },
  },

  // ============================================================================
  // GENERAL / RESOURCES
  // ============================================================================
  general: {
    user: {
      name: "User",
      icon: "user",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
    users: {
      name: "Users",
      icon: "users",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
    client: {
      name: "Client",
      icon: "client",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
    mobileClient: {
      name: "Mobile Client",
      icon: "mobile_client",
      fillColor: "#232F3D",
      width: 41,
      height: 78,
    },
    traditionalServer: {
      name: "Traditional Server",
      icon: "traditional_server",
      fillColor: "#232F3D",
      width: 45,
      height: 78,
    },
    corporateDataCenter: {
      name: "Data Center",
      icon: "corporate_data_center",
      fillColor: "#232F3D",
      width: 53,
      height: 78,
    },
    officeBuilding: {
      name: "Office Building",
      icon: "office_building",
      fillColor: "#232F3D",
      width: 50,
      height: 78,
    },
    internet: {
      name: "Internet",
      icon: "internet",
      fillColor: "#232F3D",
      width: 78,
      height: 48,
    },
    globe: {
      name: "Globe",
      icon: "globe",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
    genericDatabase: {
      name: "Generic Database",
      icon: "generic_database",
      fillColor: "#232F3D",
      width: 59,
      height: 78,
    },
    genericApplication: {
      name: "Generic Application",
      icon: "generic_application",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
    genericFirewall: {
      name: "Generic Firewall",
      icon: "generic_firewall",
      fillColor: "#232F3D",
      width: 78,
      height: 66,
    },
    disk: {
      name: "Disk",
      icon: "disk",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
    document: {
      name: "Document",
      icon: "document",
      fillColor: "#232F3D",
      width: 57,
      height: 78,
    },
    documents: {
      name: "Documents",
      icon: "documents",
      fillColor: "#232F3D",
      width: 64,
      height: 78,
    },
    folder: {
      name: "Folder",
      icon: "folder",
      fillColor: "#232F3D",
      width: 78,
      height: 71,
    },
    gear: {
      name: "Gear",
      icon: "gear",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
    servers: {
      name: "Servers",
      icon: "servers",
      fillColor: "#232F3D",
      width: 78,
      height: 78,
    },
  },
};

// ============================================================================
// GROUPS
// ============================================================================

/**
 * AWS4 group/container style definitions.
 * Used for creating VPC, Region, Subnet, and other container shapes.
 */
export const AWS4_GROUPS: Record<string, AWS4GroupDefinition> = {
  awsCloud: {
    name: "AWS Cloud",
    grIcon: "group_aws_cloud_alt",
    strokeColor: "#232F3E",
    fillColor: "none",
    fontColor: "#232F3E",
    dashed: false,
  },
  awsCloudAlt: {
    name: "AWS Cloud (Alt)",
    grIcon: "group_aws_cloud",
    strokeColor: "#232F3E",
    fillColor: "none",
    fontColor: "#232F3E",
    dashed: false,
  },
  region: {
    name: "Region",
    grIcon: "group_region",
    strokeColor: "#00A4A6",
    fillColor: "none",
    fontColor: "#147EBA",
    dashed: true,
  },
  availabilityZone: {
    name: "Availability Zone",
    strokeColor: "#147EBA",
    fillColor: "none",
    fontColor: "#147EBA",
    dashed: true,
    simple: true, // No grIcon, uses simple rectangle
  },
  securityGroup: {
    name: "Security Group",
    strokeColor: "#DD3522",
    fillColor: "none",
    fontColor: "#DD3522",
    dashed: false,
    simple: true,
  },
  vpc: {
    name: "VPC",
    grIcon: "group_vpc2",
    strokeColor: "#8C4FFF",
    fillColor: "none",
    fontColor: "#AAB7B8",
    dashed: false,
  },
  privateSubnet: {
    name: "Private Subnet",
    grIcon: "group_security_group",
    strokeColor: "#00A4A6",
    fillColor: "#E6F6F7",
    fontColor: "#147EBA",
    dashed: false,
    grStroke: 0,
  },
  publicSubnet: {
    name: "Public Subnet",
    grIcon: "group_security_group",
    strokeColor: "#7AA116",
    fillColor: "#F2F6E8",
    fontColor: "#248814",
    dashed: false,
    grStroke: 0,
  },
  autoScalingGroup: {
    name: "Auto Scaling Group",
    grIcon: "group_auto_scaling_group",
    strokeColor: "#D86613",
    fillColor: "none",
    fontColor: "#D86613",
    dashed: true,
    centered: true,
  },
  ec2InstanceContents: {
    name: "EC2 Instance Contents",
    grIcon: "group_ec2_instance_contents",
    strokeColor: "#D86613",
    fillColor: "none",
    fontColor: "#D86613",
    dashed: false,
  },
  elasticBeanstalkContainer: {
    name: "Elastic Beanstalk Container",
    grIcon: "group_elastic_beanstalk",
    strokeColor: "#D86613",
    fillColor: "none",
    fontColor: "#D86613",
    dashed: false,
  },
  spotFleet: {
    name: "Spot Fleet",
    grIcon: "group_spot_fleet",
    strokeColor: "#D86613",
    fillColor: "none",
    fontColor: "#D86613",
    dashed: false,
  },
  stepFunctionsWorkflow: {
    name: "Step Functions Workflow",
    grIcon: "group_aws_step_functions_workflow",
    strokeColor: "#CD2264",
    fillColor: "none",
    fontColor: "#CD2264",
    dashed: false,
  },
  awsAccount: {
    name: "AWS Account",
    grIcon: "group_account",
    strokeColor: "#CD2264",
    fillColor: "none",
    fontColor: "#CD2264",
    dashed: false,
  },
  corporateDataCenter: {
    name: "Corporate Data Center",
    grIcon: "group_corporate_data_center",
    strokeColor: "#7D8998",
    fillColor: "none",
    fontColor: "#5A6C86",
    dashed: false,
  },
  serverContents: {
    name: "Server Contents",
    grIcon: "group_on_premise",
    strokeColor: "#7D8998",
    fillColor: "none",
    fontColor: "#5A6C86",
    dashed: false,
  },
  iotGreengrassDeployment: {
    name: "IoT Greengrass Deployment",
    grIcon: "group_iot_greengrass_deployment",
    strokeColor: "#7AA116",
    fillColor: "none",
    fontColor: "#3F8624",
    dashed: false,
  },
  iotGreengrass: {
    name: "IoT Greengrass",
    grIcon: "group_iot_greengrass",
    strokeColor: "#7AA116",
    fillColor: "none",
    fontColor: "#3F8624",
    dashed: false,
  },
  generic: {
    name: "Generic Group",
    strokeColor: "#5A6C86",
    fillColor: "none",
    fontColor: "#5A6C86",
    dashed: true,
    simple: true,
  },
  genericFilled: {
    name: "Generic Group (Filled)",
    strokeColor: "none",
    fillColor: "#EFF0F3",
    fontColor: "#232F3D",
    dashed: false,
    simple: true,
  },
};

// ============================================================================
// STYLE BUILDER FUNCTIONS
// ============================================================================

/**
 * Build a complete style string for an AWS4 resource icon.
 * @param iconName - Icon identifier (e.g., 'lambda', 'ec2', 's3')
 * @param options - Style options
 * @returns Complete style string for insertVertex
 */
export function buildResourceIconStyle(
  iconName: string,
  options: ResourceIconStyleOptions = {},
): string {
  const fillColor = options.fillColor || "#232F3E";
  return (
    AWS4_BASE.RESOURCE_ICON +
    `resourceIcon;resIcon=mxgraph.aws4.${iconName};fillColor=${fillColor}`
  );
}

/**
 * Build a complete style string for an AWS4 product icon.
 * @param iconName - Icon identifier
 * @param options - Style options
 * @returns Complete style string for insertVertex
 */
export function buildProductIconStyle(
  iconName: string,
  options: ProductIconStyleOptions = {},
): string {
  const fillColor = options.fillColor || "#232F3D";
  return AWS4_BASE.PRODUCT_ICON + `${iconName};fillColor=${fillColor}`;
}

/**
 * Build a complete style string for an AWS4 group container.
 * @param groupType - Group type from AWS4_GROUPS (e.g., 'vpc', 'region')
 * @param options - Style options
 * @returns Complete style string for insertVertex
 */
export function buildGroupStyle(
  groupType: string,
  options: GroupStyleOptions = {},
): string {
  const groupDef = AWS4_GROUPS[groupType] || AWS4_GROUPS.generic;
  const strokeColor = options.strokeColor || groupDef.strokeColor;
  const fillColor = options.fillColor || groupDef.fillColor;
  const fontColor = options.fontColor || groupDef.fontColor;
  const dashed = groupDef.dashed ? ";dashed=1" : "";

  // Simple groups without grIcon
  if (groupDef.simple) {
    return (
      `fillColor=${fillColor};strokeColor=${strokeColor}${dashed};` +
      `verticalAlign=top;fontStyle=0;fontColor=${fontColor};whiteSpace=wrap;html=1;`
    );
  }

  // Groups with grIcon
  const grStroke =
    groupDef.grStroke !== undefined ? `;grStroke=${groupDef.grStroke}` : "";
  const align = groupDef.centered
    ? "align=center;spacingTop=25;"
    : "align=left;spacingLeft=30;";

  return (
    AWS4_BASE.GROUP +
    `group;grIcon=mxgraph.aws4.${groupDef.grIcon}${grStroke};` +
    `strokeColor=${strokeColor};fillColor=${fillColor}${dashed};` +
    `verticalAlign=top;${align}fontColor=${fontColor}`
  );
}

/**
 * Look up an icon definition by name across all categories.
 * @param iconName - Icon name to find (case-insensitive)
 * @param category - Optional category hint for faster lookup
 * @returns Icon definition or null if not found
 */
export function findIcon(
  iconName: string,
  category?: string,
): AWS4IconLookupResult | null {
  const lowerName = iconName.toLowerCase();

  // If category provided, search there first
  if (category && AWS4_ICONS[category]) {
    const icon = Object.entries(AWS4_ICONS[category]).find(
      ([key, def]) =>
        key.toLowerCase() === lowerName ||
        def.icon.toLowerCase() === lowerName ||
        def.name.toLowerCase() === lowerName,
    );
    if (icon) return { key: icon[0], ...icon[1], category };
  }

  // Search all categories
  for (const [cat, icons] of Object.entries(AWS4_ICONS)) {
    const icon = Object.entries(icons).find(
      ([key, def]) =>
        key.toLowerCase() === lowerName ||
        def.icon.toLowerCase() === lowerName ||
        def.name.toLowerCase() === lowerName,
    );
    if (icon) return { key: icon[0], ...icon[1], category: cat };
  }

  return null;
}

/**
 * Get all available icon categories.
 * @returns Array of category names
 */
export function getCategories(): string[] {
  return Object.keys(AWS4_ICONS);
}

/**
 * Get all icons in a specific category.
 * @param category - Category name
 * @returns Object with icon definitions or null if category not found
 */
export function getIconsByCategory(category: string): AWS4IconCategory | null {
  return AWS4_ICONS[category] || null;
}

/**
 * Get all available group types.
 * @returns Array of group type names
 */
export function getGroupTypes(): string[] {
  return Object.keys(AWS4_GROUPS);
}

/**
 * Parse a style string into an object.
 * @param styleString - mxGraph style string
 * @returns Style object with key-value pairs
 */
export function parseStyleString(
  styleString: string | null | undefined,
): StyleObject {
  if (!styleString) return {};
  const result: StyleObject = {};
  const pairs = styleString.split(";");
  for (const pair of pairs) {
    if (pair) {
      const [key, value] = pair.split("=");
      if (key) {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Convert a style object to a style string.
 * @param styleObj - Style object
 * @returns mxGraph style string
 */
export function buildStyleString(
  styleObj: StyleObject | null | undefined,
): string {
  if (!styleObj) return "";
  const parts: string[] = [];
  for (const key in styleObj) {
    if (Object.prototype.hasOwnProperty.call(styleObj, key)) {
      parts.push(`${key}=${styleObj[key]}`);
    }
  }
  return parts.join(";");
}

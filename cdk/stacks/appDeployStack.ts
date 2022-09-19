import {Stack, StackProps, CfnParameter} from 'aws-cdk-lib';
import {Construct} from 'constructs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export interface AppDeployProps extends StackProps {
  readonly cdnDomainName: string
  readonly cdnId: string
  readonly siteSourcePath: string;
  readonly siteBucketName: string;
}

export class AppDeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cdnDomainName = new CfnParameter(this, "cdnDomainName", {
      type: "String",
      description: "The URL of the CloudFront Distribution"});

    const cdnId = new CfnParameter(this, "cdnId", {
      type: "String",
      description: "The ID of the CloudFront Distribution"});

    const siteBucketName = new CfnParameter(this, "siteBucketName", {
      type: "String",
      description: "The name of the static host s3 bucket "});

    const distribution = cloudfront.Distribution.fromDistributionAttributes(this, 'deployDist', {
        domainName: cdnDomainName.valueAsString,
        distributionId: cdnId.valueAsString
    })

    const siteBucket = s3.Bucket.fromBucketName(this, 'siteBucket', siteBucketName.valueAsString)

    // Deploy site to S3 bucket
    new s3deploy.BucketDeployment(this, 'bucketDeployment', {
      sources: [s3deploy.Source.asset('../build')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
    
  }
}

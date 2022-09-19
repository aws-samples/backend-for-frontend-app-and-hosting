import {Stack, StackProps, Stage, StageProps, CfnOutput, RemovalPolicy,} from 'aws-cdk-lib';
import {Construct} from 'constructs';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import { resourceLabel } from '../lib/utils';

export interface AppHostProps extends StackProps {
  readonly siteDomain: string
}

export class AppHostStack extends Stack {
  public readonly cloudFrontId: CfnOutput;
  public readonly cloudFrontUrl: CfnOutput;
  public readonly siteBucketName: CfnOutput;

  constructor(scope: Construct, id: string, props: AppHostProps) {
    super(scope, id, props);

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, resourceLabel('static-cloudfront-OAI', id), {
      comment: `OAI for ${id}`
    });

    // static content s3 bucket
    const siteBucket = new s3.Bucket(this, 'site-bucket', {
      bucketName: resourceLabel(props.siteDomain, id),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,

      //CAUTION: setting true will destroy the S3 bucket in case of failure / destruction
      //not recommended for production
      removalPolicy: RemovalPolicy.DESTROY, 
      autoDeleteObjects: true, 
    });

    //Grant access to cloudfront
    siteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [siteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    // Set up the CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'site-distribution', {
      originConfigs: [
          {
              s3OriginSource: {
                  s3BucketSource: siteBucket,
                  originAccessIdentity: cloudfrontOAI
              },
              behaviors: [{
                  isDefaultBehavior: true,
                  compress: true,
                  allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
              }],
          }
        ]
    });

    this.cloudFrontId = new CfnOutput(this, 'CloudFrontId', {
      value: distribution.distributionId
    });

    this.cloudFrontUrl = new CfnOutput(this, 'CloudFrontUrl', {
      value: distribution.distributionDomainName
    });

    this.siteBucketName = new CfnOutput(this, 'SiteBucketName', { 
      value: siteBucket.bucketName 
    })
    
  }
}


export interface AppHostProps extends StageProps {
  readonly siteDomain: string
}

export class AppHostStage extends Stage {
public readonly cloudFrontId: CfnOutput;
public readonly cloudFrontUrl: CfnOutput;
public readonly siteBucketName: CfnOutput;

  constructor(scope: Construct, id: string, props: AppHostProps) {
      super(scope, id, props);

      const appHost = new AppHostStack(this, 'AppHost', props);

      this.cloudFrontId = appHost.cloudFrontId;
      this.cloudFrontUrl = appHost.cloudFrontUrl;
      this.siteBucketName = appHost.siteBucketName;

  }
}
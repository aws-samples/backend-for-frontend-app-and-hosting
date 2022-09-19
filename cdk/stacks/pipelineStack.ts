import {Stack, StackProps, aws_iam } from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";
import {Construct} from 'constructs';
import { BackendStage } from './backendStack';
import { AppHostStage } from './appHostStack';

export interface AppProps extends StackProps {
  readonly siteDomain: string
  readonly siteSourcePath: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: AppProps) {
    super(scope, id, props);

    const repo = new codecommit.Repository(this, 'BffAppRepo', {
      repositoryName: "BFFApp"
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'BFFAppPipeline',
      synth: new CodeBuildStep('SynthStep', {
              input: CodePipelineSource.codeCommit(repo, 'main'),
              installCommands: [
                  'npm install -g aws-cdk'
              ],
              commands: [
                  'cd cdk',
                  'npm ci',
                  'npm run build',
                  'npx cdk synth BffAppPipelineStack'
              ]
          }
      )
  });

  const backendDeploy = new BackendStage(this, 'BackendDeploy', props);
  pipeline.addStage(backendDeploy);

  const apphostDeploy = new AppHostStage(this, 'frontendDeploy', props);
  const apphostDeployStage = pipeline.addStage(apphostDeploy);

  const appDeployStep = new CodeBuildStep('BffFrontendDeploy', {
    projectName: 'BffFrontendDeploy',
    envFromCfnOutputs: {
      API_ID: backendDeploy.apiId,
      API_URL: backendDeploy.apiUrl,
      API_KEY: backendDeploy.apiKey,
      CDN_URL: apphostDeploy.cloudFrontUrl,
      CDN_ID: apphostDeploy.cloudFrontId,
      S3_NAME: apphostDeploy.siteBucketName
    },
    installCommands: [
      'npm i -g aws-cdk'
    ],
    commands: [
      'npm ci',
      'npm run bind -- --api-url $API_URL --api-key $API_KEY',
      'npm run build',
      'cd cdk',
      'npm ci',
      'npx cdk deploy AppDeployStack --parameters cdnDomainName=$CDN_URL --parameters cdnId=$CDN_ID --parameters siteBucketName=$S3_NAME --require-approval=never'
    ]
  })
  apphostDeployStage.addPost(appDeployStep);

  pipeline.buildPipeline();
  appDeployStep.project.addToRolePolicy(
    new aws_iam.PolicyStatement({
      actions: ["sts:AssumeRole"],
      resources: [
        "arn:*:iam::*:role/*-deploy-role-*",
        "arn:*:iam::*:role/*-publishing-role-*",
      ],
    })
  );

  appDeployStep.project.addToRolePolicy(
    new aws_iam.PolicyStatement({
      actions: ["cloudformation:DescribeStacks"],
      resources: ["*"], // this is needed to check the status of the bootstrap stack when doing `cdk deploy`
    })
  );

  // S3 checks for the presence of the ListBucket permission
  appDeployStep.project.addToRolePolicy(
    new aws_iam.PolicyStatement({
      actions: ["s3:ListBucket"],
      resources: ["*"],
    })
  );
  
  }



}


//https://medium.com/hatchsoftware/hosting-a-static-single-page-application-on-aws-using-the-cdk-f601b3ed9a6
//https://aws.plainenglish.io/cdk-pipelines-beyond-basics-37b731b7a182
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from './stacks/pipelineStack';
import { AppDeployStack } from './stacks/appDeployStack';

const domainName = 'bffapp';

const app = new cdk.App();

new PipelineStack(app, 'BffAppPipelineStack', {
  siteDomain: domainName,
  siteSourcePath: '../build'
});

new AppDeployStack(app, 'AppDeployStack');
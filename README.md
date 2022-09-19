# Backend For Frontned with Frontend Host and Deploy

This solution deploys both a Frontend Applicaiton, and the Backend For Frontend including the data API and hosting for the Frontend Applicaiton, and joins the Backend to the Frontend through the use of pre-deploy script and CDK Pipeline Deploy.

## Architecture

__Backend:__
A GraphQL API with AWS AppSync, backed by an Amazon DynamoDB table to store data demonstrating GraphQL Mutations and Queries.

__App Host:__
An S3 bucket containing the Frontend App static resources supported by a CloudFront distribution, to cache the static App at the edge.

__Frontend:__
A Simple React App, demonstrating integration with AppSync GraphQL API Queries, Mutations and Subscriptions.

## Deployment

### Prerequisites
- AWS Account, with IAM user, and CodeCommit HTTPS credentials.
- Node.js installed on local development machine.
- AWS CLI installed on local development machine.
- CDK CLI installed on local development machine.
- GIT installed on local development machine.
- CDK Bootstrap to Region for App to be hosted.

### Steps
1. Open a teminal in the `cdk` folder of the BFFApp project.
2. Run command `npm ci` to install required npm packages
3. Run command `cdk deploy`, to deploy CodeCommit and CodePipline
4. Get CodeCommit https url from Console, and set as remote upstream repository
5. Run Commands `git add --all`, `git commit -am "init commit"`, and `git push`, to push all code into CodeCommit, and trigger initial deployment. 

### Clean Up

To delete the entire solution, run the command `cdk destroy` in a terminal, from the `cdk` folder of the BFFApp project.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
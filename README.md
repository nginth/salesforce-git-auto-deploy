#### What?
Automatically deploy to a certain salesforce org when you push to a repo.

#### Why?
Salesforce attempts to have a native (and proprietary) solution to everything, but they fall short when it comes to version control (as in there's none of it). This makes it really hard to collaborate on projects, and the result is that you run into conflicts way more often than you should. This project is the first step in creating a reasonable git-based workflow that is easy to use and doesn't add unneeded complexity to an already (unintendedly) convoluted workflow. 

#### Is this secure?
I can make no guarentees about the safety of this app, but I do verify [Github Webhook Secrets](https://developer.github.com/webhooks/securing/), so you can be relatively sure that no malicious payloads will make their way into your Salesforce org unless your secret key is compromised.

#### Features:
- Push modified files to salesforce org
- Push new files to salesforce org
- Delete deleted files from salesforce org 
- Post to a callback url when job finished

#### Documentation (WIP)

### Installation
- Clone this repository.
- `npm install`
- Set the environment variables down below.
- You're all set!

### Config

The following environment variables are **required**:

```sh
GHWH_SECRET=<secret>
GHWH_ENDPOINT="/example-endpoint"
SALESFORCE_USER="foo@bar.com"
SALESFORCE_PASS="waycoolpassword"
SALESFORCE_LOGINURL="(https://login.salesforce.com | https://test.salesforce.com)"
```

The following environment variables are **optional**:
```sh
GHWH_CALLBACK="http://this.is.my.callbackurl.pizza"
```


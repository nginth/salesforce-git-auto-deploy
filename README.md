(in development)

### What?
Automatically deploy to a certain salesforce org when you push to a repo.

### Why?
Salesforce attempts to have a native (and proprietary) solution to everything, but they fall short when it comes to version control (as in there's none of it). This makes it really hard to collaborate on projects, and the result is that you run into conflicts way more often than you should. This project is the first step in creating a reasonable git-based workflow that is easy to use and doesn't add unneeded complexity to an already (unintendedly) convoluted workflow. 

### Todo:
- [x] Recieve push payload
- [x] Validate secret
- [x] Parse response
- [x] Get salesforce user/pass from ~~environment~~ yaml config file
- [ ] Push modified files to salesforce org
- [ ] Push new files to salesforce org
- [ ] Delete deleted files from salesforce org (is this possible?)
- [ ] Post to a callback url when job finished

### Documentation (WIP)

#### Config

You'll need to set the following environment variables:

```
GHWH_SECRET: <secret>
SALESFORCE_USER: foo@bar.com
SALESFORCE_PASS: waycoolpassword
SALESFORCE_LOGINURL: (https://login.salesforce.com | https://test.salesforce.com) 
```


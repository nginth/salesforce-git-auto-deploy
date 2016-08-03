(in development)

Automatically deploy to a certain salesforce org when you push to a repo.

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

`GHWH_SECRET` - the github webhook secret (see [https://developer.github.com/webhooks/securing/](https://developer.github.com/webhooks/securing/))
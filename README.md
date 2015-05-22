# aws-rotate-cert

Rotate an SSL certificate in AWS on all of your Cloudfront distributions and Elastic Load Balancers

## Requirements

* [nodejs](https://nodejs.org/download/) v0.12 or higher

## Usage

Install aws-rotate-cert from NPM:

`$ npm install -g aws-rotate-cert`

Use aws-rotate-cert to rotate your old and new certificates in the us-east-1 region:

```
$ aws-rotate-cert us-east-1 example.org-2014-04-07 example.org-2015-05-21
Updated 1 Cloudfront distributions
Updated 1 Elastic Load Balancers
```

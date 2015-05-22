#!/usr/bin/env node

var async = require("async");
var AWS = require("aws-sdk");
var cloudfront = require("../lib/cloudfront");
var iam = require("../lib/iam");

var old_cert_name = process.argv[2];
var new_cert_name = process.argv[3];

if (!old_cert_name || !new_cert_name) {
  console.error("Usage: aws-rotate-cert <old-certificate-name> <new-certificate-name>");
  process.exit(1);
}

async.auto({
  certs: async.apply(iam.get, old_cert_name, new_cert_name),
  distributions: ["certs", function(auto_cb, results) {
    cloudfront.list(results.certs.old.id, auto_cb);
  }],
  update_distributions: ["certs", "distributions", function(auto_cb, results) {
    if (results.distributions.length === 0) {
      return auto_cb(null, []);
    }

    cloudfront.update(results.distributions, results.certs.new.id, auto_cb);
  }]
}, function(auto_error, results) {
  if (auto_error) {
    console.error(auto_error.stack);
    process.exit(1);
  }

  console.log("Updated %d Cloudfront distributions", results.update_distributions.length);
});

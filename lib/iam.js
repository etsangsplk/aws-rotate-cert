var async = require("async");
var AWS = require("aws-sdk");
var iam = new AWS.IAM();

module.exports = {
  get: function(old_cert_name, new_cert_name, lib_cb) {
    async.parallel([
      async.apply(iam.getServerCertificate.bind(iam), { ServerCertificateName: old_cert_name }),
      async.apply(iam.getServerCertificate.bind(iam), { ServerCertificateName: new_cert_name }),
    ], function(iam_error, certificates) {
      if (iam_error) {
        return lib_cb(iam_error);
      }

      var certs = {
        old: {
          arn: certificates[0].ServerCertificate.ServerCertificateMetadata.Arn,
          id: certificates[0].ServerCertificate.ServerCertificateMetadata.ServerCertificateId,
          name: old_cert_name
        },
        new: {
          arn: certificates[1].ServerCertificate.ServerCertificateMetadata.Arn,
          id: certificates[1].ServerCertificate.ServerCertificateMetadata.ServerCertificateId,
          name: new_cert_name
        }
      };

      lib_cb(null, certs);
    });
  }
};

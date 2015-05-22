var async = require("async");
var AWS = require("aws-sdk");
var cloudfront = new AWS.CloudFront();

module.exports = {
  list: function(old_cert_id, lib_cb) {
    cloudfront.listDistributions(function(cf_error, distributions) {
      if (cf_error) {
        return lib_cb(cf_error);
      }

      var distributions_to_update = distributions.DistributionList.Items.filter(function(d) {
        return d.ViewerCertificate.IAMCertificateId === old_cert_id;
      }).map(function(d) {
        return d.Id;
      });

      lib_cb(null, distributions_to_update);
    });
  },
  update: function(distributions, new_cert_id, lib_cb) {
    async.waterfall([
      function(waterfall_cb) {
        waterfall_cb(null, distributions.map(function(id) { return { Id: id }; }));
      },
      function(distributions, waterfall_cb) {
        async.mapSeries(distributions, cloudfront.getDistribution.bind(cloudfront), waterfall_cb);
      },
      function(distributions, waterfall_cb) {
        var updated_config = distributions.map(function(d) {
          var update = {
            DistributionConfig: d.Distribution.DistributionConfig,
            Id: d.Distribution.Id,
            IfMatch: d.ETag
          };

          update.DistributionConfig.ViewerCertificate.IAMCertificateId = new_cert_id;

          return update;
        });

        waterfall_cb(null, updated_config);
      },
      function(distributions, waterfall_cb) {
        async.mapSeries(distributions, cloudfront.updateDistribution.bind(cloudfront), waterfall_cb);
      }
    ], lib_cb);
  }
};

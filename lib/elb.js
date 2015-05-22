var async = require("async");
var AWS = require("aws-sdk");

module.exports = {
  list: function(region, old_cert_arn, lib_cb) {
    var elb = new AWS.ELB({
      region: region
    });

    elb.describeLoadBalancers(function(elb_error, elbs) {
      if (elb_error) {
        return lib_cb(elb_error);
      }

      var elbs_to_update = elbs.LoadBalancerDescriptions.filter(function(elb) {
        return elb.ListenerDescriptions.some(function(listener) {
          return listener.Listener.SSLCertificateId === old_cert_arn;
        });
      }).map(function(elb) {
        return elb.ListenerDescriptions.map(function(listener) {
          if (listener.Listener.SSLCertificateId !== old_cert_arn) {
            return;
          }

          return {
            LoadBalancerName: elb.LoadBalancerName,
            LoadBalancerPort: listener.Listener.LoadBalancerPort,
            SSLCertificateId: listener.Listener.SSLCertificateId
          };
        });
      });

      var flattened = [].concat.apply([], elbs_to_update).filter(function(f) { return !!f; });

      lib_cb(null, flattened);
    });
  },
  update: function(region, loadbalancers, new_cert_arn, lib_cb) {
    var elb = new AWS.ELB({
      region: region
    });

    var update_loadbalancers = loadbalancers.map(function(lb) {
      lb.SSLCertificateId = new_cert_arn;

      return lb;
    });

    async.mapSeries(update_loadbalancers, elb.setLoadBalancerListenerSSLCertificate.bind(elb), lib_cb);
  }
};

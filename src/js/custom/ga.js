window.dataLayer = window.dataLayer || [];
function gtag() {
	dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "UA-71451202-1");

if (typeof window.onerror == "object") {
	window.onerror = function (err, url, line) {
		if (ga) {
			ga("send", "exception", {exDescription: `${url} at line ${line}: ${err}`, exFatal: true});
		}
	};
}

class gadata {
	constructor(classname, actionname, targetpage, eventusername = null, eventemail = null, eventreceivername = null, eventreceiveremail = null, actionstatus = null, resourceref = null, errormsg = null, metric) {
		var connection = window.navigator.connection || null;
		if (connection != null) var networktype = connection.effectiveType;
		else var networktype = "null";

		this.dimension1 = "web";
		this.dimension2 = classname;
		this.dimension3 = actionname;
		this.dimension4 = targetpage;
		this.dimension5 = eventusername;
		this.dimension6 = eventemail;
		this.dimension7 = eventreceivername;
		this.dimension8 = eventreceiveremail;
		this.dimension9 = networktype;
		this.dimension10 = actionstatus;
		this.dimension11 = resourceref;
		this.dimension12 = errormsg;
		this.metric1 = metric;
	}
}

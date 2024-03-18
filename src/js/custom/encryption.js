function do_status(s) {
	document.ecdhtest.status.value = s;
}

function set_ec_params(name) {
	var c = getSECCurveByName(name);

	document.ecdhtest.q.value = c.getCurve().getQ().toString();
	document.ecdhtest.a.value = c.getCurve().getA().toBigInteger().toString();
	document.ecdhtest.b.value = c.getCurve().getB().toBigInteger().toString();
	document.ecdhtest.gx.value = c.getG().getX().toBigInteger().toString();
	document.ecdhtest.gy.value = c.getG().getY().toBigInteger().toString();
	document.ecdhtest.n.value = c.getN().toString();

	// Changing EC params invalidates everything else
	document.ecdhtest.alice_priv.value = "";
	document.ecdhtest.bob_priv.value = "";
	document.ecdhtest.alice_pub_x.value = "";
	document.ecdhtest.alice_pub_y.value = "";
	document.ecdhtest.bob_pub_x.value = "";
	document.ecdhtest.bob_pub_y.value = "";
	document.ecdhtest.alice_key_x.value = "";
	document.ecdhtest.alice_key_y.value = "";
	document.ecdhtest.bob_key_x.value = "";
	document.ecdhtest.bob_key_y.value = "";

	do_status("Using " + name + " EC parameters");
}

function set_secp128r1() {
	set_ec_params("secp128r1");
}

function set_secp160k1() {
	set_ec_params("secp160k1");
}

function set_secp160r1() {
	set_ec_params("secp160r1");
}

function set_secp192k1() {
	set_ec_params("secp192k1");
}

function set_secp192r1() {
	set_ec_params("secp192r1");
}

function set_secp224r1() {
	set_ec_params("secp224r1");
}

function set_secp256r1() {
	set_ec_params("secp256r1");
}

var rng;

function do_init() {
	if (document.ecdhtest.q.value.length == 0) set_secp256r1();
	rng = new SecureRandom();
}

function get_curve() {
	return new ECCurveFp(new BigInteger(document.ecdhtest.q.value), new BigInteger(document.ecdhtest.a.value), new BigInteger(document.ecdhtest.b.value));
}

function get_G(curve) {
	return new ECPointFp(curve, curve.fromBigInteger(new BigInteger(document.ecdhtest.gx.value)), curve.fromBigInteger(new BigInteger(document.ecdhtest.gy.value)));
}

function pick_rand() {
	do_init();
	var n = new BigInteger(document.ecdhtest.n.value);
	var n1 = n.subtract(BigInteger.ONE);
	var r = new BigInteger(n.bitLength(), rng);
	return r.mod(n1).add(BigInteger.ONE);
}

function do_alice_rand() {
	var r = pick_rand();
	document.ecdhtest.alice_priv.value = r.toString();
	document.ecdhtest.alice_pub_x.value = "";
	document.ecdhtest.alice_pub_y.value = "";
	document.ecdhtest.alice_key_x.value = "";
	document.ecdhtest.alice_key_y.value = "";
	document.ecdhtest.bob_key_x.value = "";
	document.ecdhtest.bob_key_y.value = "";
	do_status("Alice's random value generated");
}

function do_bob_rand() {
	var r = pick_rand();
	document.ecdhtest.bob_priv.value = r.toString();
	document.ecdhtest.bob_pub_x.value = "";
	document.ecdhtest.bob_pub_y.value = "";
	document.ecdhtest.alice_key_x.value = "";
	document.ecdhtest.alice_key_y.value = "";
	document.ecdhtest.bob_key_x.value = "";
	document.ecdhtest.bob_key_y.value = "";
	do_status("Bob's random value generated");
}

function do_alice_pub() {
	if (document.ecdhtest.alice_priv.value.length == 0) {
		alert("Please111 generate Alice's private value first");
		return;
	}
	var before = new Date();
	var curve = get_curve();
	var G = get_G(curve);
	var a = new BigInteger(document.ecdhtest.alice_priv.value);
	var P = G.multiply(a);
	var after = new Date();
	document.ecdhtest.alice_pub_x.value = P.getX().toBigInteger().toString();
	document.ecdhtest.alice_pub_y.value = P.getY().toBigInteger().toString();
	document.ecdhtest.bob_key_x.value = "";
	document.ecdhtest.bob_key_y.value = "";
	do_status("Alice's public point computed in " + (after - before) + "ms");
}

function do_bob_pub() {
	if (document.ecdhtest.bob_priv.value.length == 0) {
		alert("Local file Bob's private value first");
		return;
	}
	var before = new Date();
	var curve = get_curve();
	var G = get_G(curve);
	var a = new BigInteger(document.ecdhtest.bob_priv.value);
	var P = G.multiply(a);
	var after = new Date();
	document.ecdhtest.bob_pub_x.value = P.getX().toBigInteger().toString();
	document.ecdhtest.bob_pub_y.value = P.getY().toBigInteger().toString();
	document.ecdhtest.alice_key_x.value = "";
	document.ecdhtest.alice_key_y.value = "";
	do_status("Bob's public point computed in " + (after - before) + "ms");
}

function do_alice_key() {
	if (document.ecdhtest.alice_priv.value.length == 0) {
		alert("Local file Please generate Alice's private value first");
		return;
	}
	if (document.ecdhtest.bob_pub_x.value.length == 0) {
		alert("Please compute Bob's public value first");
		return;
	}
	var before = new Date();
	var curve = get_curve();
	var P = new ECPointFp(curve, curve.fromBigInteger(new BigInteger(document.ecdhtest.bob_pub_x.value)), curve.fromBigInteger(new BigInteger(document.ecdhtest.bob_pub_y.value)));
	var a = new BigInteger(document.ecdhtest.alice_priv.value);
	var S = P.multiply(a);
	var after = new Date();
	document.ecdhtest.alice_key_x.value = S.getX().toBigInteger().toString();
	document.ecdhtest.alice_key_y.value = S.getY().toBigInteger().toString();
	do_status("Alice's key derived in " + (after - before) + "ms");
	//console.log("Hex shared key is " + curve.encodePointHex(S));
	//SHA256 calculations
	var hash = sha256.create();
	hash.update(curve.encodePointHex(S));
	var hashedValue = hash.hex();

	//localStorage.setItem("key_hashed",hashedValue);
	localStorage.setItem("tempHKey", hashedValue);
}

function do_bob_key() {
	if (document.ecdhtest.bob_priv.value.length == 0) {
		alert("Please generate Bob's private value first");
		return;
	}
	if (document.ecdhtest.alice_pub_x.value.length == 0) {
		alert("Please compute Alice's public value first");
		return;
	}
	var before = new Date();
	var curve = get_curve();
	var P = new ECPointFp(curve, curve.fromBigInteger(new BigInteger(document.ecdhtest.alice_pub_x.value)), curve.fromBigInteger(new BigInteger(document.ecdhtest.alice_pub_y.value)));
	var a = new BigInteger(document.ecdhtest.bob_priv.value);
	var S = P.multiply(a);
	var after = new Date();
	document.ecdhtest.bob_key_x.value = S.getX().toBigInteger().toString();
	document.ecdhtest.bob_key_y.value = S.getY().toBigInteger().toString();
	do_status("Bob's key derived in " + (after - before) + "ms");
}

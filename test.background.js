// mocked browser defined in mocha.tests.html to avoid console errors
describe('parse weird urls', function () {
    let mediumUrlStr = 'https://medium.com/m/callback/facebook?#access_token=abcde&data_access_expiration_time=1604336229&expires_in=3771&state=%7Chttps%3A%2F%2Fmedium.com%2F%3Fsource%3Dlogin--------------------------landing_home_nav-%7Clogin%7C16ad7596e1db5a1cbfcabd41e0c7791b%7Cda69f530e6c45f9c2ceb2e3ad64e70318f15b6872a9e825ac1c294e303f20478';
    let accessTokenFirst = 'https://medium.com/m/callback/facebook?#access_token=abcde&id_token=fghijk'
    let noAccesstoken = 'https://medium.com/m/callback/facebook?#id_token=fghijk'
    
    it('properly finds access_token in a weird url', () => {
        let accessToken = findToken(mediumUrlStr, 'access_token');
        expect(accessToken).to.eql('abcde');
    });

    it('properly finds an id token at the end', () => {
        let idToken = findToken(accessTokenFirst, 'id_token');
        expect(idToken).to.eql('fghijk');
    });

    it('properly finds an id token and no access token', () => {
        let accessToken = findToken(noAccesstoken, 'access_token');
        let idToken = findToken(noAccesstoken, 'id_token');
        expect(accessToken).to.be(null);
        expect(idToken).to.eql('fghijk');
    });

    it('properly identifes the origin', () => {
        parseUrl(mediumUrlStr);
        expect(Object.keys(offenses).length).to.be(1);
        let offense = offenses['https://medium.com'];
        expect(offense.accessToken.token).to.eql('abcde');
        expect(offense.accessToken.claims).to.be(undefined);
        expect(offense.idToken).to.be(undefined);
    });
});
describe('Parseing urls, looking for implicit flow', function () {

    let accessTokenJwt = 'eyJraWQiOiI5ckxfUzN2NkVGSThLUFhmalJiU2F1M0xmSjRmVHFXaWJOdFVLWkEzU28wIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULnB6ZDJXdXY3S3NicE5YQmlaM2FqQWRscDJjQkJHeVliSjBseXhtMnBYdGMiLCJpc3MiOiJodHRwczovL21pY2FoLm9rdGEuY29tL29hdXRoMi9hdXMyeXJjejdhTXJtREFLWjF0NyIsImF1ZCI6Im9rdGEtb2lkYy1mdW4iLCJpYXQiOjE1NzcxMTQ3NjMsImV4cCI6MTU3NzIwMTE2MywiY2lkIjoiMG9hMnlyYmYzNVZjYm9tNDkxdDciLCJ1aWQiOiIwMHUyeXVsdXA0ZVdiT3R0ZDF0NyIsInNjcCI6WyJvcGVuaWQiXSwic3ViIjoib2t0YV9vaWRjX2Z1bkBva3RhLmNvbSIsImdyb3VwcyI6WyJFdmVyeW9uZSIsIkFCQzEyMyIsInVzZXJzIiwiYWRtaW5zIl19.QUQLkfYJ5_x0xVz0Yrc9rZ3WSkxo3BkXsUZy6_4YJU1oFbxXLAvNpqFat8aanN_oPhXhlR2ri_Z7PxHLWHJkSlDvSvtZYk9tE8kMZaSpc9ggSulhcxdY_C2duYpsqhdPwHDYESiClIeaWfB29bW7i_UhRgGLtKDQW_zdWDYIm9oj88JVHm5FOCzE_WVIZp6PT7GyaYxInH7BaCFfkvNtuwDXGneV3yTTKKNylEfki_79oztkAMKeEa15G1cZRmX3Ey_-MU-SqtZ7MDGdBZO79FZ4c4lS0DyTIV7LUFiVM98c6IBf5u6vk4iSH7aiLSnUPtHj9QOdwVp7Iq5CrKVWqA';
    let accessTokenClaims = { 
        ver: 1,
        jti: 'AT.pzd2Wuv7KsbpNXBiZ3ajAdlp2cBBGyYbJ0lyxm2pXtc',
        iss: 'https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7',
        aud: 'okta-oidc-fun',
        iat: 1577114763,
        exp: 1577201163,
        cid: '0oa2yrbf35Vcbom491t7',
        uid: '00u2yulup4eWbOttd1t7',
        scp: [ 'openid' ],
        sub: 'okta_oidc_fun@okta.com',
        groups: [ 'Everyone', 'ABC123', 'users', 'admins' ] 
    };

    let idTokenJwt = 'eyJraWQiOiI5ckxfUzN2NkVGSThLUFhmalJiU2F1M0xmSjRmVHFXaWJOdFVLWkEzU28wIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHUyeXVsdXA0ZVdiT3R0ZDF0NyIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9taWNhaC5va3RhLmNvbS9vYXV0aDIvYXVzMnlyY3o3YU1ybURBS1oxdDciLCJhdWQiOiIwb2EyeXJiZjM1VmNib200OTF0NyIsImlhdCI6MTU3NzExNDc2MywiZXhwIjoxNTc3MTE4MzYzLCJqdGkiOiJJRC4wTE1MS1NCVXgyclZ5R2R0MGdORkhaY3ZOdGhNXzBLRUlKWW1La25jaTJzIiwiYW1yIjpbInB3ZCJdLCJpZHAiOiIwMG8xenl5cW85YnBSZWhDdzF0NyIsIm5vbmNlIjoiMzM2MTJjMTAtZDBiZi00OGY5LTg5MzItZjBkZjdjM2RlMjU2IiwiYXV0aF90aW1lIjoxNTc3MTE0NzU4LCJhdF9oYXNoIjoiQkJnanExU2tsYUlkWlM5LXpFOWZKdyIsImZ1bGxfbmFtZSI6Ik9rdGEgT0lEQyBGdW4ifQ.FLCUaPA9P7CMS28EjlTA4jaIS0y1F9vJqvo39DoaV7wnuV5tD21trt9Af-iBdtzaTk8IbKVkO0za2YWXVHj2fZzyMqoVPYzf3ycbzvUP_7YxP08VIawMoZCszJ-Svyh8Kxl-HyT4E5RbRoP4L8m_3E-ArtTsdSYh3QY3OxlPUwq-NjvW0aPkHJJioSxGmq0q3GxHJN6a8SkYFPwXCo3BefKk0el9yb6mIxbaDu9PMI67CCTbBFNWD8DQYD105QbSmoxvu6blmN-7tRDAiNVZqj1Po9DgSa7c0kaiv3V3elDpsRDlOhiAlsLYoI0kBTSwrvmhdnUUsFPHNNKJZmW2Mg';
    let idTokenClaims = {
        "sub": "00u2yulup4eWbOttd1t7",
        "ver": 1,
        "iss": "https://micah.okta.com/oauth2/aus2yrcz7aMrmDAKZ1t7",
        "aud": "0oa2yrbf35Vcbom491t7",
        "iat": 1577114763,
        "exp": 1577118363,
        "jti": "ID.0LMLKSBUx2rVyGdt0gNFHZcvNthM_0KEIJYmKknci2s",
        "amr": [
            "pwd"
        ],
        "idp": "00o1zyyqo9bpRehCw1t7",
        "nonce": "33612c10-d0bf-48f9-8932-f0df7c3de256",
        "auth_time": 1577114758,
        "at_hash": "BBgjq1SklaIdZS9-zE9fJw",
        "full_name": "Okta OIDC Fun"
    };

    it('can reset offenses', () => {
        offenses = {'https://example.com': {}};
        reset();
        expect(offenses).to.eql({});
    });

    it('can ignore urls without tokens', () => {
        parseUrl('https://example.com');
        expect(offenses).to.eql({});
    });

    it('can ignore urls with fragments, but no tokens', () => {
        parseUrl('https://example.com#a=b&c=d');
        expect(offenses).to.eql({});
    });

    it('can ignore urls with query strings, but no tokens', () => {
        parseUrl('https://example.com?a=b&c=d');
        expect(offenses).to.eql({});
    });

    it('can detect access token (not a jwt, no id token)', () => {
        parseUrl('https://example.com#access_token=foobar')
        expect(Object.keys(offenses).length).to.be(1);
        let offense = offenses['https://example.com'];
        expect(offense.accessToken.token).to.eql('foobar');
        expect(offense.accessToken.claims).to.be(undefined);
        expect(offense.idToken).to.be(undefined);
    });

    it('can detect a jwt access token (no id token)', () => {
        parseUrl('https://example.com#access_token=' + accessTokenJwt)
        let offense = offenses['https://example.com'];
        expect(offense.accessToken.token).to.eql(accessTokenJwt);
        expect(offense.accessToken.claims).to.eql(accessTokenClaims);
    });

    it('can parse access token that\'s not a jwt with multiple dots', () => {
        parseUrl('https://example.com#access_token=foobar.dots.should.be.ignored');
        let offense = offenses['https://example.com'];
        expect(offense.accessToken.token).to.eql('foobar.dots.should.be.ignored');
        expect(offense.accessToken.claims).to.be(undefined);
    });

    it('can parse access token that\'s not a jwt with exactly two dots', () => {
        parseUrl('https://example.com#access_token=foobar.dots_should_be.ignored');
        let offense = offenses['https://example.com'];
        expect(offense.accessToken.token).to.eql('foobar.dots_should_be.ignored');
        expect(offense.accessToken.claims).to.be(undefined);
    });

    it('can parse access token and id token, both jwts', () => {
        parseUrl('https://example.com#access_token=' + accessTokenJwt + '&id_token=' + idTokenJwt);
        let offense = offenses['https://example.com'];
        expect(offense.accessToken.token).to.eql(accessTokenJwt);
        expect(offense.accessToken.claims).to.eql(accessTokenClaims);
        expect(offense.idToken.token).to.eql(idTokenJwt);
        expect(offense.idToken.claims).to.eql(idTokenClaims);
    });

    it('can parse multiple sites', () => {
        parseUrl('https://example.com#access_token=' + accessTokenJwt + '&id_token=' + idTokenJwt);
        parseUrl('https://another.example.com#access_token=' + accessTokenJwt + '&id_token=' + idTokenJwt);
        expect(Object.keys(offenses).length).to.be(2);
        let offense = offenses['https://another.example.com'];
        expect(offense.accessToken.token).to.eql(accessTokenJwt);
        expect(offense.accessToken.claims).to.eql(accessTokenClaims);
        expect(offense.idToken.token).to.eql(idTokenJwt);
        expect(offense.idToken.claims).to.eql(idTokenClaims);
    });
});
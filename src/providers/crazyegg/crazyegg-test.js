!(function () {

    suite('CrazyEgg');


    // Initialize
    // ----------

    test('stores settings and adds javascript on initialize', function (done) {
        expect(window.CE2).not.to.exist;

        analytics.initialize({
            'CrazyEgg' : '0013/8301'
        });
        expect(analytics.providers[0].settings.apiKey).to.equal('0013/8301');


        setTimeout(function () {
            expect(window.CE2).to.exist;
            done();
        }, 1500);
    });

}());

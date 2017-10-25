var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;
var helpers = require('../helpers');
var mochaLogger = require('mocha-logger');

module.exports = (artifact, accounts) => {

    var validOwner = accounts[0];
    var validCharity = accounts[1];
    var validParticipant = accounts[2];
    var validParticipant2 = accounts[3];
    var validParticipant3 = accounts[4];
    var validParticipant4 = accounts[5];
    var validCharitySplit = 49;
    var validWinnerSplit = 49;
    var validOwnerSplit = 2;
    var validValuePerEntry = 1000;

    var validCharityRandom = helpers.random();
    var validCharityHashedRandom = helpers.hashedRandom(validCharityRandom, validCharity);

    it("should reject cancel before first construct", async () => {
        var instance = await artifact.new();
        assert.isRejected(instance.cancel({ from: validOwner }));
    });

    it("should cancel (by owner) after construct", async () => {

        var instance = await artifact.new();

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        await instance.kickoff(
            validCharity,
            validCharitySplit,
            validWinnerSplit,
            validOwnerSplit,
            validValuePerEntry,
            validStartTime,
            validRevealTime,
            validEndTime,
            { from: validOwner }
        );

        await instance.cancel({ from: validOwner });

        var actualCancelled = instance.cancelled.call();
        assert.isOk(actualCancelled);

    });

    it("should cancel (by charity) after construct", async () => {

        var instance = await artifact.new();

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        await instance.kickoff(
            validCharity,
            validCharitySplit,
            validWinnerSplit,
            validOwnerSplit,
            validValuePerEntry,
            validStartTime,
            validRevealTime,
            validEndTime,
            { from: validOwner }
        );

        await instance.cancel({ from: validCharity });

        var actualCancelled = instance.cancelled.call();
        assert.isOk(actualCancelled);

    });

    it("should reject cancel from participant", async () => {

        var instance = await artifact.new();

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        await instance.kickoff(
            validCharity,
            validCharitySplit,
            validWinnerSplit,
            validOwnerSplit,
            validValuePerEntry,
            validStartTime,
            validRevealTime,
            validEndTime,
            { from: validOwner }
        );

        assert.isRejected(instance.cancel({ from: validParticipant }));

    });

    it("should cancel after seed", async () => {

        var instance = await artifact.new();

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        await instance.kickoff(
            validCharity,
            validCharitySplit,
            validWinnerSplit,
            validOwnerSplit,
            validValuePerEntry,
            validStartTime,
            validRevealTime,
            validEndTime,
            { from: validOwner }
        );

        await instance.seed(validCharityHashedRandom, { from: validCharity });

        await instance.cancel({ from: validOwner });

        var actualCancelled = instance.cancelled.call();
        assert.isOk(actualCancelled);

    });

    it("should refund after funding", async () => {

        var instance = await artifact.new();

        var validRandom = helpers.random();
        var validHashedRandom = helpers.hashedRandom(validRandom, validParticipant);
        var validRandom2 = helpers.random();
        var validHashedRandom2 = helpers.hashedRandom(validRandom2, validParticipant2);
        var validRandom3 = helpers.random();
        var validHashedRandom3 = helpers.hashedRandom(validRandom3, validParticipant3);
        var validRandom4 = helpers.random();
        var validHashedRandom4 = helpers.hashedRandom(validRandom4, validParticipant4);

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        await instance.kickoff(
            validCharity,
            validCharitySplit,
            validWinnerSplit,
            validOwnerSplit,
            validValuePerEntry,
            validStartTime,
            validRevealTime,
            validEndTime,
            { from: validOwner }
        );

        await instance.seed(validCharityHashedRandom, { from: validCharity });

        // wait for charity to start
        await helpers.sleep(helpers.timeInterval + (helpers.timeInterval / 2));

        await instance.participate(
            validHashedRandom,
            { from: validParticipant }
        );

        await instance.participate(
            validHashedRandom2,
            { from: validParticipant2 }
        );

        await instance.participate(
            validHashedRandom3,
            { from: validParticipant3 }
        );

        await instance.participate(
            validHashedRandom4,
            { from: validParticipant4 }
        );

        // run fallback function
        await instance.sendTransaction({ from: validParticipant, value: 10000 });
        await instance.sendTransaction({ from: validParticipant2, value: 15000 });
        await instance.sendTransaction({ from: validParticipant3, value: 20000 });
        await instance.sendTransaction({ from: validParticipant4, value: 25000 });

        await instance.cancel({ from: validOwner });

        var actualCancelled = instance.cancelled.call();
        assert.isOk(actualCancelled);

        var actualParticipantBalance = await instance.balance.call(validParticipant, { from: validParticipant });
        var actualParticipant2Balance = await instance.balance.call(validParticipant2, { from: validParticipant });
        var actualParticipant3Balance = await instance.balance.call(validParticipant3, { from: validParticipant });
        var actualParticipant4Balance = await instance.balance.call(validParticipant4, { from: validParticipant });

        assert.equal(actualParticipantBalance, 10000, "refund balance incorrect");
        assert.equal(actualParticipant2Balance, 15000, "refund balance 2 incorrect");
        assert.equal(actualParticipant3Balance, 20000, "refund balance 3 incorrect");
        assert.equal(actualParticipant4Balance, 25000, "refund balance 4 incorrect");

    });

    it("should refund after revelation", async () => {

        var instance = await artifact.new();

        var validRandom = helpers.random();
        var validHashedRandom = helpers.hashedRandom(validRandom, validParticipant);
        var validRandom2 = helpers.random();
        var validHashedRandom2 = helpers.hashedRandom(validRandom2, validParticipant2);
        var validRandom3 = helpers.random();
        var validHashedRandom3 = helpers.hashedRandom(validRandom3, validParticipant3);
        var validRandom4 = helpers.random();
        var validHashedRandom4 = helpers.hashedRandom(validRandom4, validParticipant4);

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        await instance.kickoff(
            validCharity,
            validCharitySplit,
            validWinnerSplit,
            validOwnerSplit,
            validValuePerEntry,
            validStartTime,
            validRevealTime,
            validEndTime,
            { from: validOwner }
        );

        await instance.seed(validCharityHashedRandom, { from: validCharity });

        // wait for charity to start
        await helpers.sleep(helpers.timeInterval + (helpers.timeInterval / 2));

        await instance.participate(
            validHashedRandom,
            { from: validParticipant }
        );

        await instance.participate(
            validHashedRandom2,
            { from: validParticipant2 }
        );

        await instance.participate(
            validHashedRandom3,
            { from: validParticipant3 }
        );

        await instance.participate(
            validHashedRandom4,
            { from: validParticipant4 }
        );

        // run fallback function
        await instance.sendTransaction({ from: validParticipant, value: 10000 });
        await instance.sendTransaction({ from: validParticipant2, value: 15000 });
        await instance.sendTransaction({ from: validParticipant3, value: 20000 });
        await instance.sendTransaction({ from: validParticipant4, value: 25000 });

        await helpers.sleep(helpers.timeInterval);

        await instance.reveal(
            validRandom,
            { from: validParticipant }
        );

        await instance.reveal(
            validRandom2,
            { from: validParticipant2 }
        );

        await instance.reveal(
            validRandom3,
            { from: validParticipant3 }
        );

        await instance.cancel({ from: validOwner });

        var actualCancelled = instance.cancelled.call();
        assert.isOk(actualCancelled);

        var actualParticipantBalance = await instance.balance.call(validParticipant, { from: validParticipant });
        var actualParticipant2Balance = await instance.balance.call(validParticipant2, { from: validParticipant });
        var actualParticipant3Balance = await instance.balance.call(validParticipant3, { from: validParticipant });
        var actualParticipant4Balance = await instance.balance.call(validParticipant4, { from: validParticipant });

        assert.equal(actualParticipantBalance, 10000, "refund balance incorrect");
        assert.equal(actualParticipant2Balance, 15000, "refund balance 2 incorrect");
        assert.equal(actualParticipant3Balance, 20000, "refund balance 3 incorrect");
        assert.equal(actualParticipant4Balance, 25000, "refund balance 4 incorrect");

    });

    it("should reject cancel after end", async () => {

        var validRandom = helpers.random();
        var validHashedRandom = helpers.hashedRandom(validRandom, validParticipant);
        var validRandom2 = helpers.random();
        var validHashedRandom2 = helpers.hashedRandom(validRandom2, validParticipant2);
        var validRandom3 = helpers.random();
        var validHashedRandom3 = helpers.hashedRandom(validRandom3, validParticipant3);
        var validRandom4 = helpers.random();
        var validHashedRandom4 = helpers.hashedRandom(validRandom4, validParticipant4);

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        var instance = await artifact.new();

        await instance.kickoff(
            validCharity,
            validCharitySplit,
            validWinnerSplit,
            validOwnerSplit,
            validValuePerEntry,
            validStartTime,
            validRevealTime,
            validEndTime,
            { from: validOwner }
        );

        await instance.seed(validCharityHashedRandom, { from: validCharity });

        // wait for charity to start
        await helpers.sleep(helpers.timeInterval + (helpers.timeInterval / 2));

        await instance.participate(
            validHashedRandom,
            { from: validParticipant }
        );

        await instance.participate(
            validHashedRandom2,
            { from: validParticipant2 }
        );

        await instance.participate(
            validHashedRandom3,
            { from: validParticipant3 }
        );

        await instance.participate(
            validHashedRandom4,
            { from: validParticipant4 }
        );

        // run fallback function
        await instance.sendTransaction({ from: validParticipant, value: 10000 });
        await instance.sendTransaction({ from: validParticipant2, value: 15000 });
        await instance.sendTransaction({ from: validParticipant3, value: 20000 });
        await instance.sendTransaction({ from: validParticipant4, value: 25000 });

        await helpers.sleep(helpers.timeInterval);

        await instance.reveal(
            validRandom,
            { from: validParticipant }
        );

        await instance.reveal(
            validRandom2,
            { from: validParticipant2 }
        );

        await instance.reveal(
            validRandom3,
            { from: validParticipant3 }
        );

        await helpers.sleep(helpers.timeInterval);

        // first participant should be allowed to end the charity
        await instance.end(validCharityRandom, { from: validCharity });

        var winner = await instance.winner.call();
        assert.isOk(
            (winner == validParticipant)
            || (winner == validParticipant2)
            || (winner == validParticipant3)
            , "one participant that revealed should have won");

        assert.isRejected(instance.cancel({ from: validOwner }));
        
    });

}
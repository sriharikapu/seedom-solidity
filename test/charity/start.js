var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;
var helpers = require('../helpers');

module.exports = (artifact, accounts) => {

    var validOwner = accounts[0];
    var validCharity = accounts[1];
    var validParticipant = accounts[2];
    var validParticipant2 = accounts[3];
    var validCharitySplit = 49;
    var validWinnerSplit = 49;
    var validOwnerSplit = 2;
    var validValuePerEntry = 1000;

    it("should start properly", async () => {

        var instance = await artifact.new();

        var actualWinner = await instance.winner.call({ from: validOwner });
        var actualCancelled = await instance.cancelled.call({ from: validOwner });
        var actualTotalEntries = await instance.totalEntries.call({ from: validOwner });
        var actualTotalRevealed = await instance.totalRevealed.call({ from: validOwner });
        var actualTotalParticipants = await instance.totalParticipants.call({ from: validOwner });
        var actualTotalRevealers = await instance.totalRevealers.call({ from: validOwner });

        assert.equal(actualWinner, 0, "winner zero");
        assert.isOk(actualCancelled, "initially cancelled");
        assert.equal(actualTotalEntries, 0, "total entries zero");
        assert.equal(actualTotalRevealed, 0, "total revealed zero");
        assert.equal(actualTotalParticipants, 0, "total participants zero");
        assert.equal(actualTotalRevealers, 0, "total revealers zero");

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        await instance.start(
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

        var actualCharity = await instance.charity.call({ from: validOwner });
        var actualCharitySplit = await instance.charitySplit.call({ from: validOwner });
        var actualWinnerSplit = await instance.winnerSplit.call({ from: validOwner });
        var actualOwnerSplit = await instance.ownerSplit.call({ from: validOwner });
        var actualValuePerEntry = await instance.valuePerEntry.call({ from: validOwner });
        var actualStartTime = await instance.startTime.call({ from: validOwner });
        var actualRevealTime = await instance.revealTime.call({ from: validOwner });
        var actualEndTime = await instance.endTime.call({ from: validOwner });

        assert.equal(actualCharity, validCharity, "charity does not match");
        assert.equal(actualCharitySplit, validCharitySplit, "charity split does not match");
        assert.equal(actualWinnerSplit, validWinnerSplit, "winner split does not match");
        assert.equal(actualOwnerSplit, validOwnerSplit, "validOwner split does not match");
        assert.equal(actualValuePerEntry, validValuePerEntry, "wei per entry does not match");
        assert.equal(actualStartTime, validStartTime, "start time does not match");
        assert.equal(actualRevealTime, validRevealTime, "reveal time does not match");
        assert.equal(actualEndTime, validEndTime, "end time does not match");

    });

    it("should fail to start with completely invalid data", async () => {

        var instance = await artifact.new();

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        var promises = [];
        [[0, 49, 49, 2, 1000, validStartTime, validRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 0, 49, 2, 1000, validStartTime, validRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 0, 2, 1000, validStartTime, validRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 0, 1000, validStartTime, validRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 0, validStartTime, validRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, 0, validRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, validStartTime, 0, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, validStartTime, validRevealTime, 0, { from: validOwner }]].forEach((args) => {
            promises.push(assert.isRejected(instance.start.apply(this, args)));
        });

        return Promise.all(promises);

    });

    it("should fail to start with invalid dates", async () => {

        var instance = await artifact.new();

        var validStartTime = helpers.now() + helpers.timeInterval;
        var validRevealTime = validStartTime + helpers.timeInterval;
        var validEndTime = validRevealTime + helpers.timeInterval;

        var oldStartTime = helpers.now() - (helpers.timeInterval * 3);
        var oldRevealTime = oldStartTime + helpers.timeInterval;
        var oldEndTime = oldRevealTime + helpers.timeInterval;

        var promises = [];
        // old dates
        [[validCharity, 49, 49, 2, 1000, oldStartTime, validRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, validStartTime, oldRevealTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, validStartTime, validRevealTime, oldEndTime, { from: validOwner }],
        // equal dates
        [validCharity, 49, 49, 2, 1000, validStartTime, validStartTime, validStartTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, validStartTime, validStartTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, validStartTime, validRevealTime, validRevealTime, { from: validOwner }],
        // out of order dates
        [validCharity, 49, 49, 2, 1000, validRevealTime, validStartTime, validEndTime, { from: validOwner }],
        [validCharity, 49, 49, 2, 1000, validStartTime, validEndTime, validRevealTime, { from: validOwner }]].forEach((args) => {
            promises.push(assert.isRejected(instance.start.apply(this, args)));
        });

        return Promise.all(promises);

    });

}
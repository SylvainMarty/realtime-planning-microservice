// eslint-disable-next-line @typescript-eslint/no-var-requires
const { connect, StringCodec } = require('nats');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4 } = require('uuid');

async function createNats() {
  // to create a connection to a nats-server:
  const nc = await connect({ servers: 'localhost:4222' });

  // create a codec
  const sc = StringCodec();

  return {
    sendRandomNatsMessage() {
      const startHour = Math.floor(Math.random() * 23);
      const endHour = Math.floor(Math.random() * (23 - startHour) + startHour);

      const payload = {
        start: new Date(
          `2023-12-13T${startHour.toString().padStart(2, '0')}:00:00Z`,
        ),
        end: new Date(
          `2023-12-13T${endHour.toString().padStart(2, '0')}:00:00Z`,
        ),
        reference: v4().toString(),
        // booked | cancelled
        status: 'booked',
        item: {
          name: 'Visite du louvre',
        },
        customer: {
          firstname: 'Black',
          lastname: 'Widow',
          phone: '+33652525252',
        },
        guides: [
          { firstname: 'Chuck', lastname: 'Norris', email: 'chuck@norris.com' },
          {
            firstname: 'Captain',
            lastname: 'America',
            email: 'captain@america.com',
          },
        ],
      };

      nc.publish(
        `events.order.booking.${payload.status}`,
        sc.encode(JSON.stringify(payload)),
      );
    },
    async close() {
      // we want to insure that messages that are in flight
      // get processed, so we are going to drain the
      // connection. Drain is the same as close, but makes
      // sure that all messages in flight get seen
      // by the iterator. After calling drain on the connection
      // the connection closes.
      await nc.drain();
    },
  };
}

async function run() {
  // console.log('Sending random message to NATS');
  const conn = await createNats();
  conn.sendRandomNatsMessage();
  await conn.close();
}

module.exports = {
  run,
};
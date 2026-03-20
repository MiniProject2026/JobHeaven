import {Kafka} from 'kafkajs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const startSendMailConsumer = async () => {
    try {
        const kafka = new Kafka({
            clientId: 'mail-service',
            brokers: [process.env.kafka_Broker || "localhost:9092"],
        });

        const consumer = kafka.consumer({ groupId: 'mail-group' });
        await consumer.connect();

        const topicName = 'send-mail';
        await consumer.subscribe({ topic: topicName, fromBeginning: false});
        console.log("👍mail service consumer started,listening for sending mails...");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
               try {
                const{to , subject, html} = JSON.parse(message.value?.toString() || '{}');

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: "jangiddee999@gmail.com",
                        pass: "wfttqjdvxdptdilc",
                    },

                });

                await transporter.sendMail({
                    from: "JobHeaven <no-reply>",
                    to,
                    subject,
                    html,
                });
                console.log(`Email sent to ${to} with subject: ${subject}`);
            } catch (error) {
              console.log("failed to send email:", error);
            }
        },
    });

    } catch (error) {
        console.error("failed to start kafka consumer ", error);
    }
}

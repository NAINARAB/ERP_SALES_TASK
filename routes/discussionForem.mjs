import express from 'express';
import topics from '../controller/DiscussionForem/discussionTopics.mjs'

const TopicsRouter = express.Router();

TopicsRouter.get('/discussionTopic', topics.getTopics);
TopicsRouter.post('/discussionTopic', topics.createTopics);
TopicsRouter.put('/discussionTopic', topics.updateTopics);
TopicsRouter.delete('/discussionTopic', topics.deleteTopics);



export default TopicsRouter;
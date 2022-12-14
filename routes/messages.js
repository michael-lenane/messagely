/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

const { Router } = require("express");
const Message = require("../models/message");

Router.get("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    let messageDetail = await Message.getMessageById(id);
    return res.json({ messageDetail });
  } catch (err) {
    return next(err);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

Router.post("/", async function (req, res, next) {
  try {
    const { from, to, body } = req.body;
    let post = await Message.createMessage(from, to, body);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

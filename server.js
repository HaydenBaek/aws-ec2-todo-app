const express = require("express");
const path = require("path");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const TABLE_NAME = process.env.TABLE_NAME || "comp3962_todos";
const REGION = process.env.AWS_REGION || "us-west-2"; // change if needed

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

app.get("/api/todos", async (req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = data.Items || [];

    // Newest first: prefer createdAt, fall back to timestamp embedded in id.
    items.sort((a, b) => {
      const aTs = Number(a.createdAt) || Number(String(a.id || "").split("todo-")[1]) || 0;
      const bTs = Number(b.createdAt) || Number(String(b.id || "").split("todo-")[1]) || 0;
      return bTs - aTs;
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read todos" });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const text = (req.body?.text || "").trim();
    if (!text) return res.status(400).json({ error: "Todo text is required" });

    const createdAt = Date.now();
    const item = { id: `todo-${createdAt}`, text, createdAt };
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

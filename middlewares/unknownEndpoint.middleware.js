export default function unknownEndpoint(res) {
  res.status(404).send({ error: "unknown endpoint" });
}

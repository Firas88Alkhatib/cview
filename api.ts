import Elysia from 'elysia'
export default () => {
  const app = new Elysia().get('/hello', () => ({ message: 'Hello world!' }))
  return app
}

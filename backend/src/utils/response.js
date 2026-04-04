export function success(res, data, message = 'Success', status = 200) {
  return res.status(status).json({ success: true, message, data })
}

export function error(res, message = 'Error', status = 400, details = null) {
  const body = { success: false, message }
  if (details) body.details = details
  return res.status(status).json(body)
}

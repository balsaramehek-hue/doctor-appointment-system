import { motion } from 'framer-motion'

export default function EmptyState({
  icon: Icon,
  title = 'Nothing here yet',
  message = 'Data will appear here once it is available.',
  action = null,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col items-center gap-3 py-16 text-center"
    >
      {Icon && <Icon className="text-4xl text-slate-300" />}
      <p className="text-base font-medium text-slate-600">{title}</p>
      <p className="max-w-sm text-sm text-slate-400">{message}</p>
      {action}
    </motion.div>
  )
}

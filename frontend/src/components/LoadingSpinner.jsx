import { FaSpinner } from 'react-icons/fa'

export default function LoadingSpinner({ size = 'md', text = 'Loading...', inline = false }) {
  const dims = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  if (inline) {
    return <FaSpinner className={`${dims[size]} animate-spin text-current`} />
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
      <FaSpinner className={`${dims[size]} animate-spin text-primary-500`} />
      {text && <p className="text-sm">{text}</p>}
    </div>
  )
}

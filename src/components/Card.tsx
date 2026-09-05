import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {title && <h3 className="card__title">{title}</h3>}
      {children}
    </section>
  )
}

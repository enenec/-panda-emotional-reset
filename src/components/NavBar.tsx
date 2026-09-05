import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/today', label: '今日计划', icon: '🌿' },
  { to: '/progress', label: '进度', icon: '🐾' },
  { to: '/library', label: '内容库', icon: '📚' },
  { to: '/settings', label: '设置', icon: '⚙️' },
]

export function NavBar() {
  return (
    <nav className="nav-bar" aria-label="主导航">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `nav-bar__item ${isActive ? 'nav-bar__item--active' : ''}`.trim()
          }
        >
          <span className="nav-bar__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="nav-bar__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

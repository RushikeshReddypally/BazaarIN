import { useApp } from '../context/AppContext'
import { categories } from '../data/categories'

export default function CategoryStrip() {
  const { activeCategory, setActiveCategory } = useApp()

  return (
    <section id="categories">
      <div className="cats-scroll">
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`cat-chip${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => {
              setActiveCategory(cat.id)
              document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <span className="cat-e">{cat.emoji}</span>
            <span className="cat-n">{cat.label}</span>
            <span className="cat-c">{cat.count}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

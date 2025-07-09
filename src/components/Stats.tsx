
export function Stats() {
  const stats = [
    { number: "50K+", label: "Alunos ativos" },
    { number: "200+", label: "Empresas parceiras" },
    { number: "1000+", label: "Cursos disponíveis" },
    { number: "95%", label: "Taxa de satisfação" }
  ];

  return (
    <section className="py-20 bg-calmon-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-calmon-100">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

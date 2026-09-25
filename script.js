const fmt = n => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    /* ---------- Clase abstracta ---------- */
    class Empleado {
      static TASA_SEGURIDAD = 0.04;
      static BONO_ALIMENTACION = 1000000;
      constructor(nombre, anios) {
        if (new.target === Empleado) throw new Error('Empleado es abstracta');
        if (!nombre || !nombre.trim()) throw new Error('El nombre es obligatorio.');
        if (isNaN(anios) || anios < 0) throw new Error('Los años en la empresa no pueden ser negativos.');
        this.nombre = nombre.trim(); this.anios = anios;
      }
      get tipo() { return 'Empleado'; }
      calcularSalarioBruto() { throw new Error('Método abstracto'); }
      calcularBonos() { return 0; }                 // bonos que se suman al bruto
      calcularBeneficios() { return 0; }            // beneficios pagados por la empresa (fuera del bruto)
      calcularAhorro() { return 0; }
      calcularDeducciones() {
        return this.calcularSalarioBruto() * Empleado.TASA_SEGURIDAD + this.calcularAhorro();
      }
      calcularSalarioNeto() {
        const neto = this.calcularSalarioBruto() + this.calcularBeneficios() - this.calcularDeducciones();
        if (neto < 0) throw new Error('El salario neto no puede ser negativo.');
        return neto;
      }
      detalle() {
        const l = [['Salario bruto', this.calcularSalarioBruto()]];
        this.lineasExtra().forEach(x => l.push(x));
        l.push(['Seguro Social y Pensión (4%)', -this.calcularSalarioBruto() * Empleado.TASA_SEGURIDAD]);
        if (this.calcularAhorro()) l.push(['Fondo de ahorro (2%)', -this.calcularAhorro()]);
        if (this.calcularBeneficios()) l.push(['Bono alimentación (empresa)', this.calcularBeneficios()]);
        return l;
      }
      lineasExtra() { return []; }
    }
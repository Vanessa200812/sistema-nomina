const fmt = n => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    /* ---------- Clase abstracta ----------RODOLFO */
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
    /*RODOLFO*/

    /* ---------- Subclases ---------- */
    class Asalariado extends Empleado {
      constructor(n, a, salario) {
        super(n, a);
        if (isNaN(salario) || salario <= 0) throw new Error('El salario debe ser mayor a 0.');
        this.salario = salario;
      }
      get tipo() { return 'Asalariado'; }
      calcularBonos() { return this.anios > 5 ? this.salario * 0.10 : 0; }
      calcularSalarioBruto() { return this.salario + this.calcularBonos(); }
      calcularBeneficios() { return Empleado.BONO_ALIMENTACION; }
      lineasExtra() { return this.calcularBonos() ? [['  incluye bono antigüedad (10%)', this.calcularBonos()]] : []; }
    }

    class PorHoras extends Empleado {
      constructor(n, a, tarifa, horas, fondo) {
        super(n, a);
        if (isNaN(horas) || horas < 0) throw new Error('Las horas trabajadas no pueden ser negativas.');
        if (isNaN(tarifa) || tarifa <= 0) throw new Error('La tarifa debe ser mayor a 0.');
        this.tarifa = tarifa; this.horas = horas; this.fondo = !!fondo;
      }
      get tipo() { return 'Por horas'; }
      get horasExtra() { return Math.max(0, this.horas - 40); }
      calcularSalarioBruto() {
        return Math.min(this.horas, 40) * this.tarifa + this.horasExtra * this.tarifa * 1.5;
      }
      calcularAhorro() {
        return (this.anios > 1 && this.fondo) ? this.calcularSalarioBruto() * 0.02 : 0;
      }
      lineasExtra() { return this.horasExtra ? [[`  incluye ${this.horasExtra} h extra (x1.5)`, this.horasExtra * this.tarifa * 1.5]] : []; }
    }

    class PorComision extends Empleado {
      constructor(n, a, base, ventas, pct) {
        super(n, a);
        if (isNaN(base) || base <= 0) throw new Error('El salario base debe ser mayor a 0.');
        if (isNaN(ventas) || ventas < 0) throw new Error('Las ventas no pueden ser menores a $0.');
        if (isNaN(pct) || pct < 0) throw new Error('El porcentaje de comisión no es válido.');
        this.base = base; this.ventas = ventas; this.pct = pct;
      }
      get tipo() { return 'Comisión'; }
      get comision() { return this.ventas * this.pct / 100; }
      calcularBonos() { return this.ventas > 20000000 ? this.ventas * 0.03 : 0; }
      calcularSalarioBruto() { return this.base + this.comision + this.calcularBonos(); }
      calcularBeneficios() { return Empleado.BONO_ALIMENTACION; }
      lineasExtra() {
        const l = [['  incluye comisión', this.comision]];
        if (this.calcularBonos()) l.push(['  incluye bono ventas (3%)', this.calcularBonos()]);
        return l;
      }
    }

    class Temporal extends Empleado {
      constructor(n, a, salario, fin) {
        super(n, a);
        if (isNaN(salario) || salario <= 0) throw new Error('El salario debe ser mayor a 0.');
        if (!fin) throw new Error('Indique la fecha de fin de contrato.');
        this.salario = salario; this.fin = fin;
      }
      get tipo() { return 'Temporal'; }
      calcularSalarioBruto() { return this.salario; }
      lineasExtra() { return [[`  contrato hasta ${this.fin}`, 0]]; }
    }

    /* ---------- Gestor ---------- */
    class Nomina {
      constructor() { this.empleados = []; }
      agregar(e) { e.calcularSalarioNeto(); this.empleados.push(e); }   // valida neto
      eliminar(i) { this.empleados.splice(i, 1); }
      total(fn) { return this.empleados.reduce((s, e) => s + fn(e), 0); }
    }

    /* ---------- UI ---------- */
    const $ = id => document.getElementById(id);
    const nomina = new Nomina();

    function campos() {
      const t = $('tipo').value;
      document.querySelectorAll('.f').forEach(el => el.classList.toggle('hide', !el.classList.contains(t)));
    }
    $('tipo').addEventListener('change', campos);

    const fabrica = {
      asalariado: () => new Asalariado($('nombre').value, +$('anios').value, +$('salario').value),
      horas: () => new PorHoras($('nombre').value, +$('anios').value, +$('tarifa').value, +$('horas').value, $('fondo').checked),
      comision: () => new PorComision($('nombre').value, +$('anios').value, +$('salario').value, +$('ventas').value, +$('pct').value),
      temporal: () => new Temporal($('nombre').value, +$('anios').value, +$('salario').value, $('fin').value)
    };

    $('add').addEventListener('click', () => {
      try {
        nomina.agregar(fabrica[$('tipo').value]());
        $('msg').textContent = ''; $('nombre').value = '';
        render();
      } catch (e) { $('msg').textContent = '⚠ ' + e.message; }
    });

    function render() {
      $('tb').innerHTML = '';
      nomina.empleados.forEach((e, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${e.nombre.replace(/</g, '&lt;')}</td><td>${e.tipo}</td>
      <td class="n">${fmt(e.calcularSalarioBruto())}</td><td class="n">${fmt(e.calcularBeneficios())}</td>
      <td class="n">${fmt(e.calcularDeducciones())}</td><td class="n"><b>${fmt(e.calcularSalarioNeto())}</b></td>
      <td><button class="sm v">Detalle</button> <button class="sm g">✕</button></td>`;
        tr.querySelector('.v').onclick = () => detalle(e);
        tr.querySelector('.g').onclick = () => { nomina.eliminar(i); $('dcard').classList.add('hide'); render(); };
        $('tb').appendChild(tr);
      });
      $('tB').textContent = fmt(nomina.total(e => e.calcularSalarioBruto()));
      $('tD').textContent = fmt(nomina.total(e => e.calcularDeducciones()));
      $('tN').textContent = fmt(nomina.total(e => e.calcularSalarioNeto()));
    }

    function detalle(e) {
      $('dcard').classList.remove('hide');
      $('dt').textContent = `Desprendible: ${e.nombre} (${e.tipo})`;
      $('dd').innerHTML = e.detalle().map(([k, v]) =>
        `<div><span>${k}</span><span class="${v < 0 ? 'neg' : ''}">${fmt(v)}</span></div>`).join('') +
        `<div class="fin"><span>Neto a pagar</span><span>${fmt(e.calcularSalarioNeto())}</span></div>`;
    }
    campos(); render();
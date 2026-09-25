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
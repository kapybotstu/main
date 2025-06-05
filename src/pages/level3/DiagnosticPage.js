import React from 'react';
import './DiagnosticPage.css';

const DiagnosticPage = () => {
  return (
    <div className="diagnostic-container">
      <h1>🔍 Diagnóstico de Blur en Tokens</h1>
      
      {/* Test 1: Número completamente puro sin estilos */}
      <div className="test-section">
        <h2>Test 1: Número Puro (sin CSS)</h2>
        <div className="test-pure">
          <span>50</span>
        </div>
      </div>

      {/* Test 2: Con background sólido */}
      <div className="test-section">
        <h2>Test 2: Con Background Sólido</h2>
        <div className="test-solid">
          <span className="token-number-solid">50</span>
        </div>
      </div>

      {/* Test 3: Con gradiente pero sin backdrop-filter */}
      <div className="test-section">
        <h2>Test 3: Gradiente Sin Backdrop-Filter</h2>
        <div className="test-gradient">
          <span className="token-number-gradient">50</span>
        </div>
      </div>

      {/* Test 4: El componente actual */}
      <div className="test-section">
        <h2>Test 4: Componente Actual</h2>
        <div className="simple-token-display">
          <div className="token-amount">
            <span className="token-number">50</span>
            <span className="token-label">Tokens Disponibles</span>
          </div>
        </div>
      </div>

      {/* Test 5: Texto normal vs token */}
      <div className="test-section">
        <h2>Test 5: Comparación</h2>
        <div className="comparison">
          <div className="normal-text">
            <h3>Texto Normal: 50</h3>
          </div>
          <div className="token-text">
            <span className="token-number">50</span>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="debug-section">
        <h2>🐛 Debug Info</h2>
        <div className="debug-info">
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          <p><strong>Screen DPI:</strong> {window.devicePixelRatio}x</p>
          <p><strong>Window Size:</strong> {window.innerWidth}x{window.innerHeight}</p>
        </div>
      </div>

      {/* CSS Checks */}
      <div className="css-checks">
        <h2>🎨 CSS Applied Checks</h2>
        <button onClick={() => {
          const element = document.querySelector('.token-number');
          if (element) {
            const styles = window.getComputedStyle(element);
            console.log('🔍 Computed styles para .token-number:');
            console.log('backdrop-filter:', styles.backdropFilter);
            console.log('filter:', styles.filter);
            console.log('opacity:', styles.opacity);
            console.log('z-index:', styles.zIndex);
            console.log('color:', styles.color);
            console.log('font-size:', styles.fontSize);
            console.log('text-shadow:', styles.textShadow);
            console.log('position:', styles.position);
            console.log('background:', styles.background);
            console.log('transform:', styles.transform);
            console.log('will-change:', styles.willChange);
            console.log('isolation:', styles.isolation);
            
            alert('Revisa la consola para ver los estilos aplicados');
          }
        }}>
          Inspeccionar Estilos del Token
        </button>

        <button onClick={() => {
          console.log('🔍 Diagnóstico completo de blur:');
          
          // Buscar todos los elementos con backdrop-filter
          const allElements = document.querySelectorAll('*');
          const elementsWithBackdrop = [];
          
          allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.backdropFilter !== 'none' || styles.webkitBackdropFilter !== 'none') {
              elementsWithBackdrop.push({
                element: el,
                tagName: el.tagName,
                className: el.className,
                backdropFilter: styles.backdropFilter,
                webkitBackdropFilter: styles.webkitBackdropFilter
              });
            }
          });
          
          console.log('Elementos con backdrop-filter:', elementsWithBackdrop);
          
          // Buscar elementos con filter
          const elementsWithFilter = [];
          allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.filter !== 'none') {
              elementsWithFilter.push({
                element: el,
                tagName: el.tagName,
                className: el.className,
                filter: styles.filter
              });
            }
          });
          
          console.log('Elementos con filter:', elementsWithFilter);
          
          // Verificar jerarquía del token
          const tokenElement = document.querySelector('.token-number');
          if (tokenElement) {
            let parent = tokenElement.parentElement;
            const hierarchy = [tokenElement];
            
            while (parent && parent !== document.body) {
              hierarchy.unshift(parent);
              parent = parent.parentElement;
            }
            
            console.log('Jerarquía de elementos del token:', hierarchy);
            
            hierarchy.forEach((el, index) => {
              const styles = window.getComputedStyle(el);
              console.log(`Nivel ${index} (${el.tagName}.${el.className}):`, {
                backdropFilter: styles.backdropFilter,
                filter: styles.filter,
                opacity: styles.opacity,
                zIndex: styles.zIndex
              });
            });
          }
          
          alert('Diagnóstico completo ejecutado. Revisa la consola.');
        }}>
          Diagnóstico Completo de Blur
        </button>
      </div>
    </div>
  );
};

export default DiagnosticPage;
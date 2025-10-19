# Detector de IA en Español

Un detector avanzado de contenido generado por IA para textos en español, con integración opcional de Hugging Face API para análisis de perplejidad mejorado. Incluye herramienta de parafraseo ético con recordatorios de citación.

## Características

## Detector de IA

### Modo Local (Sin API)
- **Análisis de uniformidad**: Detecta patrones repetitivos en la longitud de oraciones
- **Complejidad léxica**: Mide la diversidad del vocabulario
- **Variación de oraciones**: Analiza la estructura sintáctica
- **Patrones repetitivos**: Identifica frases formulaicas comunes en textos de IA
- **Naturalidad lingüística**: Detecta la presencia de coloquialismos vs. lenguaje formal
- **Uso de conectores**: Analiza la densidad de conectores textuales

### Modo Mejorado (Con API de Hugging Face)
Todas las características del modo local, más:
- **Análisis de perplejidad**: Utiliza el modelo GPT-2 español (PlanTL-GOB-ES) para calcular perplejidad
- **Análisis de burstiness**: Mide la variabilidad en la complejidad de las oraciones
- **Mayor precisión**: Combina métricas locales con análisis basado en modelos de lenguaje

## Parafraseador Ético

Una herramienta educativa para aprender a parafrasear correctamente con énfasis en la ética académica.

### Características del Parafraseador

- **Tres niveles de parafraseo**:
  - **Ligero**: Cambios mínimos, principalmente sinónimos
  - **Moderado**: Reestructuración de oraciones y vocabulario
  - **Profundo**: Reescritura completa manteniendo el significado

- **Tres alternativas por análisis**: Genera 3 versiones diferentes para cada nivel
- **Advertencias éticas**: Detecta citas, referencias y contenido potencialmente con derechos de autor
- **Guías de citación**: Proporciona formatos APA, MLA y Chicago
- **Verificación de fidelidad**: Comprueba que el significado se mantenga
- **Análisis de tono**: Identifica si el texto es formal, informal o académico

### Principios Éticos

⚠️ **Uso Responsable**:
- ✓ Siempre cita la fuente original, incluso después de parafrasear
- ✓ No ocultes la autoría - parafrasear contenido de otros como tuyo es plagio
- ✓ Respeta los derechos de autor - verifica que tienes permiso para usar el contenido
- ✓ Usa esta herramienta para **aprender** a parafrasear, no para evadir detección de plagio
- ✓ La paráfrasis NO elimina la necesidad de atribuir la fuente

### Advertencias de Seguridad

La herramienta detecta automáticamente:
- Texto entre comillas (posibles citas directas)
- Referencias a fuentes académicas
- Texto extenso y formal (posible contenido con derechos de autor)

Y proporciona advertencias pidiendo que:
1. Confirmes que tienes derecho a usar el contenido
2. Añadas las citas apropiadas
3. Verifiques las políticas de tu institución

## Instalación

1. Descarga todos los archivos en una carpeta:
   - `index.html`
   - `styles.css`
   - `detector-enhanced.js`
   - `paraphraser.js`
   - `paraphraser-ui.js`
   - `config.js`

2. Abre `index.html` en tu navegador web

3. Usa las pestañas para cambiar entre:
   - **Detector de IA**: Analiza textos para detectar contenido generado por IA
   - **Parafraseador Ético**: Reescribe textos con guías de citación

## Configuración (Opcional pero Recomendada)

Para obtener la máxima precisión, configura la integración con Hugging Face:

### Paso 1: Obtén una API Key Gratuita

1. Ve a [Hugging Face](https://huggingface.co/join)
2. Crea una cuenta gratis
3. Ve a [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Haz clic en "New token"
5. Dale un nombre (ej. "AI Detector")
6. Selecciona el tipo "Read"
7. Copia el token generado

### Paso 2: Configura el Token

Abre el archivo `config.js` y reemplaza `YOUR_API_KEY_HERE` con tu token:

```javascript
const CONFIG = {
    HUGGINGFACE_API_KEY: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    // ... resto de la configuración
};
```

### Paso 3: Guarda y Recarga

Guarda el archivo y recarga la página en tu navegador. Verás que la advertencia amarilla desaparece.

## Uso

### Usando el Detector de IA

1. Selecciona la pestaña "Detector de IA"
2. Pega o escribe el texto que deseas analizar en el área de texto
3. Haz clic en "Analizar Texto"
4. Espera mientras el sistema procesa (puede tomar 10-30 segundos con API)
5. Revisa los resultados:
   - **Probabilidad general**: Porcentaje de probabilidad de ser IA
   - **Detalles del análisis**: Métricas individuales desglosadas
   - **Texto resaltado**: Oraciones individuales marcadas por probabilidad

### Usando el Parafraseador Ético

1. Selecciona la pestaña "Parafraseador Ético"
2. Lee los principios éticos antes de comenzar
3. Pega el texto que deseas parafrasear
4. Selecciona el nivel de parafraseo:
   - **Ligero**: Para cambios sutiles manteniendo la estructura
   - **Moderado**: Para reestructuración significativa
   - **Profundo**: Para reescritura completa
5. Haz clic en "Parafrasear Texto"
6. Revisa las 3 alternativas generadas
7. **IMPORTANTE**: Copia el formato de citación apropiado y añádelo a tu trabajo
8. Usa el botón "Copiar" para copiar la alternativa que prefieras
9. Revisa la "Verificación de fidelidad" para asegurar que el significado se mantuvo

## Interpretación de Resultados

### Colores de Probabilidad
- 🔴 **Rojo (75-100%)**: Alta probabilidad de ser generado por IA
- 🟡 **Amarillo (50-74%)**: Probabilidad moderada
- 🟢 **Verde (0-49%)**: Baja probabilidad, probablemente humano

### Métricas Detalladas

- **Uniformidad**: Alta uniformidad = más probable IA
- **Complejidad léxica**: IA tiende a tener diversidad moderada-alta
- **Variación de oraciones**: Baja variación = más probable IA
- **Patrones repetitivos**: Muchos patrones = más probable IA
- **Naturalidad**: Lenguaje muy formal = más probable IA
- **Conectores**: Uso excesivo = más probable IA
- **Burstiness** (solo con API): Baja variabilidad = más probable IA
- **Perplejidad** (solo con API): Baja perplejidad = más probable IA

## Modelo Utilizado

El detector utiliza el modelo **PlanTL-GOB-ES/gpt2-large-bne** de Hugging Face cuando está configurado con API. Este modelo fue entrenado con 570GB de texto en español de la Biblioteca Nacional de España.

## Limitaciones

### Del Detector de IA
- Los resultados son **estimaciones** y no deben tomarse como definitivos
- La detección de IA es un campo en evolución; ningún detector es 100% preciso
- Textos muy cortos (<100 palabras) pueden dar resultados menos confiables
- El detector está optimizado para español, puede no funcionar bien en otros idiomas

### Del Parafraseador
- El parafraseador **no** es una herramienta anti-plagio ni anti-detección
- Los resultados son para uso educativo y deben revisarse cuidadosamente
- **SIEMPRE** se debe citar la fuente original, incluso con texto parafraseado
- No sustituye la comprensión y expresión personal del contenido
- Parafrasear sin citar sigue siendo plagio académico

## Privacidad

### Detector de IA
- **Modo Local**: Todo el procesamiento ocurre en tu navegador, ningún dato se envía a servidores
- **Modo API**: Las oraciones se envían a Hugging Face para análisis de perplejidad. Revisa la [política de privacidad de Hugging Face](https://huggingface.co/privacy)

### Parafraseador
- **Sin API configurada**: Todo el procesamiento es local, usando algoritmos de reglas y sinónimos
- **Con API configurada**: El texto se envía a Hugging Face para parafraseo mejorado con IA
- Los textos parafraseados no se almacenan en ningún servidor

## Tecnologías

- HTML5, CSS3, JavaScript (Vanilla)
- Hugging Face Inference API
- Modelo: PlanTL-GOB-ES/gpt2-large-bne

## Soporte

Si encuentras problemas:
1. Verifica que tu API key esté configurada correctamente
2. Abre la consola del navegador (F12) para ver errores
3. Asegúrate de tener conexión a internet (si usas API)

## Ética y Responsabilidad

Este proyecto incluye el parafraseador con un enfoque ético:

- **Diseñado para educación**: Ayuda a aprender técnicas correctas de parafraseo
- **No para evadir detección**: No es una herramienta anti-plagio
- **Promueve la atribución**: Incluye recordatorios constantes sobre citación
- **Detecta mal uso**: Identifica citas, referencias y contenido protegido
- **Transparente**: Todo el código es abierto y auditable

### Uso Académico

Si eres estudiante:
- Consulta las políticas de tu institución sobre herramientas de parafraseo
- Usa esta herramienta para **aprender**, no para sustituir tu trabajo
- **SIEMPRE** cita las fuentes originales
- Entiende el contenido antes de parafrasearlo
- Tu trabajo debe reflejar tu comprensión personal

### Responsabilidad del Usuario

El usuario es responsable de:
- Usar la herramienta de manera ética y legal
- Citar todas las fuentes apropiadamente
- Cumplir con las políticas de su institución
- No usar la herramienta para facilitar el plagio
- Respetar los derechos de autor

## Licencia

Este proyecto es de código abierto para uso educativo y personal.

**Advertencia**: El mal uso de esta herramienta para plagio, violación de derechos de autor, o deshonestidad académica es responsabilidad exclusiva del usuario.

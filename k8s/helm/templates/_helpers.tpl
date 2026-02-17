{{- define "validarfc.fullname" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "validarfc.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "validarfc.fullname" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{- define "validarfc.selectorLabels" -}}
app.kubernetes.io/name: {{ include "validarfc.fullname" . }}
{{- end }}

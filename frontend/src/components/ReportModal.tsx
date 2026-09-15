import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Check, Sparkles, Printer, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exportApi } from '../lib/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: string;
  totalCalories: number;
  totalWorkouts: number;
  currentWeight: number;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  dateRange,
  totalCalories,
  totalWorkouts,
  currentWeight,
}) => {
  const { user } = useAuth() as any;
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const generatePrintableReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Please allow popups in your browser to print or save the PDF report.');
    }
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fitness Performance Report - ${user?.name || 'Athlete'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .badge { background: #C4FA2A; color: #0f172a; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
            .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
            .card-value { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 6px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">FITTRACK PERFORMANCE REPORT</div>
              <div class="subtitle">Generated on ${dateStr} for ${user?.name || 'Athlete'} (${user?.email || 'User'})</div>
            </div>
            <div class="badge">Performance Summary</div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Analysis Period</div>
              <div class="card-value">${dateRange}</div>
            </div>
            <div class="card">
              <div class="card-title">Workouts Completed</div>
              <div class="card-value">${totalWorkouts} sessions</div>
            </div>
            <div class="card">
              <div class="card-title">Active Daily Calorie Burn</div>
              <div class="card-value">${totalCalories.toLocaleString()} kcal</div>
            </div>
            <div class="card">
              <div class="card-title">Current Recorded Weight</div>
              <div class="card-value">${currentWeight} ${user?.weightUnit || 'kg'}</div>
            </div>
            <div class="card">
              <div class="card-title">Primary Fitness Goal</div>
              <div class="card-value" style="text-transform: capitalize;">${(user?.fitnessGoal || 'Maintain').replace('_', ' ')}</div>
            </div>
            <div class="card">
              <div class="card-title">Daily Calorie Target</div>
              <div class="card-value">${user?.dailyCalorieGoal || 2000} kcal</div>
            </div>
          </div>

          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; font-size: 15px; font-weight: 700;">Performance Summary</h3>
            <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0;">
              During the <strong>${dateRange}</strong> interval, you logged a total of <strong>${totalWorkouts} completed workout routines</strong> with an active burn output of <strong>${totalCalories.toLocaleString()} kcal</strong>. Maintain consistent hydration and nutrition habits to support progressive overload and athletic recovery.
            </p>
          </div>

          <div class="footer">
            <span>FitTrack Health & Fitness Ecosystem</span>
            <span>Printed from live user dashboard</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage('');
    try {
      if (reportFormat === 'csv') {
        await exportApi.downloadProgressCsv();
      } else {
        generatePrintableReport();
      }
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="report-modal-card"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 relative overflow-hidden text-slate-900 dark:text-slate-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-[#C4FA2A] text-white dark:text-[#131418] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">Fitness Performance Report</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Generate printable breakdown and analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl mb-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Period:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {dateRange}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Workouts Completed:</span>
            <span className="font-bold text-slate-900 dark:text-white">{totalWorkouts} sessions</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Total Daily Energy:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{totalCalories.toLocaleString()} kcal</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Morning Weigh-in:</span>
            <span className="font-bold text-slate-900 dark:text-white">{currentWeight} {user?.weightUnit || 'kg'}</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Export Format</label>
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setReportFormat('pdf')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                reportFormat === 'pdf'
                  ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>PDF Document</span>
            </button>

            <button
              type="button"
              onClick={() => setReportFormat('csv')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                reportFormat === 'csv'
                  ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>CSV Spreadsheet</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || downloadSuccess}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>{reportFormat === 'csv' ? 'CSV File Exported!' : 'Report Ready for Print / Save!'}</span>
            </>
          ) : isExporting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin text-emerald-400 dark:text-emerald-600" />
              <span>Generating {reportFormat.toUpperCase()} Report...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>{reportFormat === 'csv' ? 'Download CSV Spreadsheet' : 'Print / Save PDF Report'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import { Controller, Post, Get, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@Controller('softphone')
export class SoftphoneController {
  private readonly logger = new Logger(SoftphoneController.name);

  /**
   * Launch Mobile Call Softphone application
   */
  @Post('launch')
  async launchSoftphone() {
    try {
      this.logger.log('🚀 Launching Mobile Call Softphone...');

      // Path to softphone directory
      const softphonePath = path.join(__dirname, '..', '..', '..', 'softphone');
      const normalizedPath = softphonePath.replace(/\\/g, '/');
      
      // Launch command - use Start-Process with new window
      const command = `Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '${normalizedPath}'; Write-Host '🚀 Starting Mobile Call...' -ForegroundColor Cyan; npm start" -WindowStyle Normal`;
      
      this.logger.log(`📂 Softphone path: ${normalizedPath}`);
      this.logger.log(`🎯 Command: ${command}`);

      // Execute command
      const { stdout, stderr } = await execAsync(command, { 
        shell: 'powershell.exe',
        windowsHide: false 
      });
      
      if (stderr) {
        this.logger.warn(`⚠️ stderr: ${stderr}`);
      }
      if (stdout) {
        this.logger.log(`📤 stdout: ${stdout}`);
      }

      this.logger.log('✅ Mobile Call Softphone launched successfully');

      return {
        success: true,
        message: 'تم تشغيل تطبيق موبايل كول بنجاح',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to launch softphone: ${error.message}`);
      this.logger.error(error.stack);

      return {
        success: false,
        error: error.message,
        message: 'فشل تشغيل التطبيق',
      };
    }
  }

  /**
   * Check if softphone is running
   */
  @Get('status')
  async checkStatus() {
    try {
      // Check if electron process is running
      const { stdout } = await execAsync(
        'tasklist | findstr electron.exe',
        { shell: 'powershell.exe' }
      );

      const isRunning = stdout.includes('electron.exe');

      return {
        running: isRunning,
        message: isRunning ? 'التطبيق يعمل' : 'التطبيق غير مشغل',
      };
    } catch (error) {
      return {
        running: false,
        message: 'التطبيق غير مشغل',
      };
    }
  }
}

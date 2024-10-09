import { Injectable } from '@nestjs/common';
import { CreateBossDto } from './dto/create-boss.dto';
import { UpdateBossDto } from './dto/update-boss.dto';
import puppeteer from 'puppeteer';
import { Job } from './entities/boss.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BossService {
  @InjectRepository(Job)
  private bossRepository: Repository<Job>;

  create(createBossDto: CreateBossDto) {
    return 'This action adds a new boss';
  }

  findAll() {}

  // 爬取所有boss前端岗位信息
  async getJobs() {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    await page.goto(
      'https://www.zhipin.com/web/geek/job?query=前端&city=101280100',
    );

    await page.waitForSelector('.job-list-box');

    const totalPage = await page.$eval(
      '.options-pages a:nth-last-child(2)',
      (el) => {
        return parseInt(el.textContent);
      },
    );

    const allJobs = [];

    for (let i = 1; i <= totalPage; i++) {
      await page.goto(
        `https://www.zhipin.com/web/geek/job?query=前端&city=101280100&page=${i}`,
      );

      await page.waitForSelector('.job-list-box');

      // 如果登录框boss-login-dialog存在，点击一下除这个dom外的点
      const loginDom = await page.$('.boss-login-dialog');
      if (loginDom) {
        await page.click('.boss-login-close');
      }

      const jobs = await page.$eval('.job-list-box', (els) => {
        return [...els.querySelectorAll('.job-card-wrapper')].map((el) => {
          const job = {
            name: el.querySelector('.job-name').textContent,
            salary: el.querySelector('.salary').textContent,
            area: el.querySelector('.job-area').textContent,
          };

          return {
            job,
            link: el.querySelector('a').href,
            company: {
              name: el.querySelector('.company-name').textContent,
            },
          };
        });
      });

      allJobs.push(...jobs);
    }

    for (let i = 0; i < allJobs.length; i++) {
      await page.goto(allJobs[i].link);
      await this.sleep(3000);
      try {
        await page.waitForSelector('.job-sec-text');
        const jd = await page.$eval('.job-sec-text', (el) => el.textContent);
        allJobs[i].desc = jd;

        // 放入数据库
        const job = new Job();
        job.name = allJobs[i].job.name;
        job.salary = allJobs[i].job.salary;
        job.area = allJobs[i].job.area;
        job.link = allJobs[i].link;
        job.company = allJobs[i].company.name;
        job.desc = allJobs[i].desc;
        await this.bossRepository.save(job);
      } catch (e) {}
    }

    await browser.close();
  }

  async sleep(time: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(time);
      }, time);
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} boss`;
  }

  update(id: number, updateBossDto: UpdateBossDto) {
    return `This action updates a #${id} boss`;
  }

  remove(id: number) {
    return `This action removes a #${id} boss`;
  }
}

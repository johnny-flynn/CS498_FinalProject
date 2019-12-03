var express = require('express');
var mustache = require('../common/mustache')
var html = require('../common/html')
var course_portfolio_lib = require('../lib/course_portfolio')
var router = express.Router();

const Department = require('../models/Department')
const TermType = require('../models/TermType')
const StudentLearningOutcomeMetric = require('../models/StudentLearningOutcome/Metric')
const Artifact = require('../models/CoursePortfolio/Artifact/index')

const course_artifact_info = async (res, req) => {
	const artifact_num = await Artifact.query()


	// Counts the number of artifacts
	num_artifacts = artifact_num.length

	let course_artifact = {
		num: num_artifacts
	};

	res.render('base_template', {
		title: 'CS498 Course Portfolio',
		body: mustache.render('course/index', course_artifact)
	})
}


const course_manage_page = async (res, course_id) => {
	const slo1 = await StudentLearningOutcomeMetric.query().findById(1)
	const slo2 = await StudentLearningOutcomeMetric.query().findById(2)
	const slo3 = await StudentLearningOutcomeMetric.query().findById(3)
	const slo4 = await StudentLearningOutcomeMetric.query().findById(4)
	const slo5 = await StudentLearningOutcomeMetric.query().findById(5)

	let course_info = {
		student_learning_outcomes: [
			{
				index: 1,
				description: course_id,
				metrics: [
					{
						name: slo1.name,
						exceeds: slo1.exceeds,
						meets: slo1.meets,
						partially: slo1.partially,
						not: slo1.not
					},
					{
						name: slo2.name,
						exceeds: slo2.exceeds,
						meets: slo2.meets,
						partially: slo2.partially,
						not: slo2.not
					},
					{
						name: slo3.name,
						exceeds: slo3.exceeds,
						meets: slo3.meets,
						partially: slo3.partially,
						not: slo3.not
					},
					{
						name: slo4.name,
						exceeds: slo4.exceeds,
						meets: slo4.meets,
						partially: slo4.partially,
						not: slo4.not
					},
					{
						name: slo5.name,
						exceeds: slo5.exceeds,
						meets: slo5.meets,
						partially: slo5.partially,
						not: slo5.not
					}
				],
				artifacts: [
					{
						name: 'n/a',
						evaluations: [
							{
								index: 1,
								evaluation: [
									{
										metric: 1,
										value: 6
									},
									{
										metric: 2,
										value: 6
									},
									{
										metric: 3,
										value: 6
									},
									{
										metric: 4,
										value: 6
									},
									{
										metric: 5,
										value: 6
									}
								]
							}
						]
					}
				]
			}
		]
	};

	res.render('base_template', {
		title: 'CS498 Course Portfolio',
		body: mustache.render('course/manage', course_info)
	})
}

const course_new_page = async (res, department = false) => {
	const departments = await Department.query().select()
	const semesters = await (await TermType.query()
		.findById('semester'))
		.$relatedQuery('terms')
	let student_learning_outcomes = true

	if (department) {
		student_learning_outcomes = await (await Department.query().findById(department))
			.$relatedQuery('student_learning_outcomes')
	}

	res.render('base_template', {
		title: 'New Course Portfolio',
		body: mustache.render('course/new', {
			departments,
			department,
			student_learning_outcomes,
			semesters
		})
	})
}


router.route('/')
	.get(html.auth_wrapper(async (req, res, next) => {
		await course_artifact_info(res, req)
	}))

/* GET course home page 
router.route('/')
	.get(html.auth_wrapper(async (req, res, next) => {
		res.render('base_template', {
			title: 'Course Portfolios',
			body: mustache.render('course/index')
		})
	}))
*/

/* GET course page */
router.route('/:id')
	.get(html.auth_wrapper(async (req, res, next) => {
		if (req.params.id === 'new') {
			await course_new_page(res)
		} else {
			await course_manage_page(res, req.params.id)
		}
	}))
	.post(html.auth_wrapper(async (req, res, next) => {
		if (req.params.id === 'new') {
			if (req.body.course_submit) {
				const course_portfolio = await course_portfolio_lib.new({
					department_id: req.body.department,
					course_number: req.body.course_number,
					instructor: 1,
					semester: req.body.semester,
					year: req.body.course_year,
					num_students: req.body.num_students,
					student_learning_outcomes: Object.entries(req.body)
						.filter(entry => entry[0].startsWith('slo_') && entry[1] === 'on')
						.map(entry => entry[0].split('_')[1]),
					section: req.body.course_section
				})

				res.redirect(302, `/course/${course_portfolio.id}`)
			} else {
				await course_new_page(res, req.body.department)
			}
		} else {
			await course_manage_page(res, 499)
		}
	}))

module.exports = router;

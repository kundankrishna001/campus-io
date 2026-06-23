
CREATE POLICY "own messages update" ON public.hr_interview_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hr_interview_sessions s WHERE s.id = hr_interview_messages.session_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hr_interview_sessions s WHERE s.id = hr_interview_messages.session_id AND s.user_id = auth.uid()));

CREATE POLICY "own messages delete" ON public.hr_interview_messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hr_interview_sessions s WHERE s.id = hr_interview_messages.session_id AND s.user_id = auth.uid()));

CREATE POLICY "own badges delete" ON public.user_badges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "own stats delete" ON public.user_stats FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
